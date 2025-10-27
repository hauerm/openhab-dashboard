import type { Item, ItemHistoryResponse } from "../types/item";
import { toast } from "react-toastify";

// Semantic property constants
export const PROPERTY_HUMIDITY = "Property_Humidity";
export const PROPERTY_TEMPERATURE = "Property_Temperature";
export const PROPERTY_CO2 = "Property_AirQuality_CO2";
export const PROPERTY_AIR_QUALITY = "Property_AirQuality_AQI";

export const OPENHAB_HOST = import.meta.env.VITE_OPENHAB_HOST || "localhost";
export const OPENHAB_PORT = import.meta.env.VITE_OPENHAB_PORT || "8080";
export const OPENHAB_PROTOCOL = import.meta.env.VITE_OPENHAB_PROTOCOL || "http"; // or 'https'
const OPENHAB_BASE_URL = `${OPENHAB_PROTOCOL}://${OPENHAB_HOST}:${OPENHAB_PORT}/rest`;

export const OPENHAB_API_TOKEN = import.meta.env.VITE_OPENHAB_API_TOKEN;
export const OPENHAB_WS_URL = `${OPENHAB_PROTOCOL.replace(
  "http",
  "ws"
)}://${OPENHAB_HOST}:${OPENHAB_PORT}/ws?access_token=${OPENHAB_API_TOKEN}`;

export async function fetchItems(): Promise<Item[]> {
  const response = await fetch(`${OPENHAB_BASE_URL}/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }
  return response.json();
}

let itemsCache: Item[] | null = null;

export async function fetchItemsMetadata(): Promise<Item[]> {
  if (itemsCache) return itemsCache;
  itemsCache = await fetchItems();
  return itemsCache!;
}

export async function sendCommand(
  itemName: string,
  command: string
): Promise<void> {
  const response = await fetch(
    `${OPENHAB_BASE_URL}/items/${encodeURIComponent(itemName)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: command,
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to send command to ${itemName}`);
  }
}

export async function fetchItem(name: string): Promise<Item> {
  const response = await fetch(
    `${OPENHAB_BASE_URL}/items/${encodeURIComponent(name)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch item");
  }
  return response.json();
}

// Returns all items with semantic type 'Measurement'
export function filterItemsBySemanticType(
  items: Item[],
  type: string = "Measurement"
): Item[] {
  return items.filter((item) => item.metadata?.semantics?.value === type);
}

// Returns all items with semantic property 'Humidity'
export function filterItemsBySemanticProperty(
  items: Item[],
  property: string = PROPERTY_HUMIDITY
): Item[] {
  return items.filter((item) => hasSemanticProperty(item, property));
}

// Helper to check if an item's semantics config has a relatesTo property matching a given value
export function hasSemanticProperty(item: Item, relatesTo: string): boolean {
  return (
    typeof item.metadata?.semantics?.config === "object" &&
    item.metadata?.semantics?.config !== null &&
    "relatesTo" in item.metadata.semantics.config &&
    item.metadata.semantics.config.relatesTo === relatesTo
  );
}

// Fetch historic state data for an item using the persistence API
// Example: getItemHistory('MyItem', { serviceId: 'influxdb', starttime: '2024-08-01T00:00:00Z', endtime: '2024-08-01T23:59:59Z' })
export async function getItemHistory(
  itemName: string,
  params?: {
    serviceId?: string;
    starttime?: string; // ISO string
    endtime?: string; // ISO string
    pageLength?: number;
    page?: number;
  }
): Promise<ItemHistoryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.serviceId) searchParams.append("serviceId", params.serviceId);
  if (params?.starttime) searchParams.append("starttime", params.starttime);
  if (params?.endtime) searchParams.append("endtime", params.endtime);
  if (params?.pageLength)
    searchParams.append("pageLength", params.pageLength.toString());
  if (params?.page) searchParams.append("page", params.page.toString());
  const url = `${OPENHAB_BASE_URL}/persistence/items/${encodeURIComponent(
    itemName
  )}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch item history");
  }
  return response.json();
}

export function connectWebSocket(
  onMessage: (event: MessageEvent) => void,
  onError?: (error: Event) => void
): WebSocket {
  const ws = new WebSocket(OPENHAB_WS_URL);
  ws.onmessage = onMessage;
  if (onError) ws.onerror = onError;
  return ws;
}

// WebSocket manager with retry logic
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private onMessageCallback: ((event: MessageEvent) => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;

  connect(
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Event) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError || null;
    this.attemptConnection();
  }

  private attemptConnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error(
        "Failed to connect to OpenHAB WebSocket after multiple attempts."
      );
      return;
    }

    try {
      this.ws = new WebSocket(OPENHAB_WS_URL);
      this.ws.onopen = () => {
        toast.success("Connected to OpenHAB WebSocket.");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };
      this.ws.onmessage = this.onMessageCallback!;
      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        if (this.onErrorCallback) this.onErrorCallback(error);
      };
      this.ws.onclose = () => {
        toast.warn("WebSocket connection lost. Retrying...");
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay *= 2; // Exponential backoff
      this.attemptConnection();
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }
}

export const webSocketManager = new WebSocketManager();
