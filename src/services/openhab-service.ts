import type { Item, ItemHistoryResponse } from "../types/item";

// Semantic property constants
export const PROPERTY_HUMIDITY = "Property_Humidity";

export const OPENHAB_HOST = "192.168.1.15";
export const OPENHAB_PORT = 9443;
export const OPENHAB_PROTOCOL = "https"; // or 'http'
const OPENHAB_BASE_URL = `${OPENHAB_PROTOCOL}://${OPENHAB_HOST}:${OPENHAB_PORT}/rest`;

export async function fetchItems(): Promise<Item[]> {
  const response = await fetch(`${OPENHAB_BASE_URL}/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }
  return response.json();
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
