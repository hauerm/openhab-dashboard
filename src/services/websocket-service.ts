import { toast } from "react-toastify";
import { getWebSocketSubprotocols, getWebSocketUrl } from "./config";
import { log } from "./logger";
import type {
  OpenHABCommandType,
  OpenHABCommandPayload,
} from "../types/openhab-types";
import { parseOpenHABState } from "./state-parser";
import type { ParsedStateKind } from "./state-parser";

const logger = log.createLogger("WebSocket");

interface ItemStatePayload {
  type: string;
  value: string;
}

interface WebSocketEventEnvelope {
  type?: string;
  topic?: string;
  payload?: string;
}

export interface WebSocketItemUpdate {
  itemName: string;
  rawState: string;
  stateType: string;
  stateKind: ParsedStateKind;
  numericValue: number | null;
  timestamp: number;
}

type WebSocketListener = (update: WebSocketItemUpdate) => void;

interface ListenerOptions {
  itemNames?: Iterable<string>;
}

interface ListenerRegistration {
  listener: WebSocketListener;
  itemNames?: Set<string>;
}

/**
 * Service for handling OpenHAB WebSocket connections and real-time updates
 */
export class WebSocketService {
  private static listeners = new Map<number, ListenerRegistration>();
  private static nextListenerId = 1;
  private static manager: WebSocketManager | null = null;
  private static isInitialized = false;
  private static initializePromise: Promise<void> | null = null;

  /**
   * Subscribe to item updates and get an unsubscribe function.
   */
  static subscribe(
    listener: WebSocketListener,
    options?: ListenerOptions
  ): () => void {
    void this.initialize();

    const id = this.nextListenerId++;
    this.listeners.set(id, {
      listener,
      itemNames: options?.itemNames ? new Set(options.itemNames) : undefined,
    });

    return () => {
      this.listeners.delete(id);
    };
  }

  /**
   * Backward-compatible numeric-only listener.
   */
  static registerListener(
    listener: (itemName: string, value: number) => void,
    options?: ListenerOptions
  ): () => void {
    return this.subscribe((update) => {
      if (update.numericValue === null) {
        return;
      }
      listener(update.itemName, update.numericValue);
    }, options);
  }

  private static dispatchUpdate(update: WebSocketItemUpdate): void {
    for (const registration of this.listeners.values()) {
      if (
        registration.itemNames &&
        !registration.itemNames.has(update.itemName)
      ) {
        continue;
      }
      registration.listener(update);
    }
  }

  private static handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(String(event.data)) as WebSocketEventEnvelope;
      if (
        data.type !== "ItemStateEvent" &&
        data.type !== "ItemStateChangedEvent" &&
        data.type !== "ItemStateUpdatedEvent"
      ) {
        return;
      }

      if (!data.topic || typeof data.topic !== "string") {
        return;
      }

      const topicParts = data.topic.split("/");
      if (topicParts.length < 4 || topicParts[0] !== "openhab") {
        return;
      }
      const itemName = topicParts[2];

      if (!data.payload || typeof data.payload !== "string") {
        return;
      }
      const payload = JSON.parse(data.payload) as ItemStatePayload;
      if (!payload || typeof payload.value !== "string") {
        return;
      }

      const parsed = parseOpenHABState(payload.value);
      this.dispatchUpdate({
        itemName,
        rawState: parsed.raw,
        stateType: payload.type,
        stateKind: parsed.kind,
        numericValue: parsed.numericValue,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("Error processing WebSocket message:", error);
    }
  }

  /**
   * Initialize the WebSocket connection
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.debug("Already initialized, skipping...");
      return;
    }

    if (this.initializePromise) {
      return this.initializePromise;
    }

    this.initializePromise = (async () => {
      try {
        if (!this.manager) {
          this.manager = new WebSocketManager();
        }

        this.manager.connect((event) => this.handleMessage(event));
        this.isInitialized = true;
      } catch (error) {
        logger.error("Failed to initialize WebSocket:", error);
        toast.error("Failed to initialize WebSocket connection.");
      }
    })();

    try {
      await this.initializePromise;
    } finally {
      this.initializePromise = null;
    }
  }

  /**
   * Disconnect the WebSocket connection
   */
  static disconnect(): void {
    if (this.manager) {
      this.manager.disconnect();
      this.manager = null;
      this.isInitialized = false;
      this.initializePromise = null;
    }
  }

  /**
   * Get the current connection status
   */
  static isConnected(): boolean {
    return this.manager?.isConnected() ?? false;
  }

  /**
   * Send a command to an item via WebSocket
   */
  static sendCommand(
    itemName: string,
    command: string | number,
    commandType: OpenHABCommandType
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.manager) {
        reject(new Error("WebSocket not initialized"));
        return;
      }

      try {
        this.manager.sendCommand(itemName, command, commandType);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

/**
 * WebSocket manager with retry logic and connection management
 */
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // start with 1 second
  private readonly maxReconnectDelay = 30000;
  private onMessageCallback: ((event: MessageEvent) => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  connect(
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Event) => void
  ): void {
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError || null;
    this.shouldReconnect = true;
    this.attemptConnection();
  }

  private attemptConnection(): void {
    this.clearReconnectTimer();

    if (!this.shouldReconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error(
        "Failed to connect to OpenHAB WebSocket after multiple attempts."
      );
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      logger.info(`Attempting WebSocket connection to: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl, getWebSocketSubprotocols());

      this.ws.onopen = () => {
        toast.success("Connected to OpenHAB WebSocket.");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = this.onMessageCallback!;

      this.ws.onerror = (error) => {
        logger.error("WebSocket error:", error);
        if (this.onErrorCallback) this.onErrorCallback(error);
      };

      this.ws.onclose = (event) => {
        this.ws = null;
        logger.info(
          `WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`
        );
        if (!this.shouldReconnect) {
          return;
        }
        if (event.code === 1006) {
          // Abnormal closure, likely certificate or network issue
          toast.error(
            "WebSocket connection failed. Check your OpenHAB server configuration."
          );
        } else {
          toast.warn("WebSocket connection lost. Retrying...");
        }
        this.scheduleReconnect();
      };
    } catch (error) {
      logger.error("Failed to create WebSocket:", error);
      toast.error(
        "Failed to create WebSocket connection. Check your OpenHAB configuration."
      );
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay
      );
      this.attemptConnection();
    }, this.reconnectDelay);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return;
    }
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  sendCommand(
    itemName: string,
    command: string | number,
    commandType: OpenHABCommandType
  ): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Always format payload as JSON with type and value (mandatory for OpenHAB)
      const commandPayload: OpenHABCommandPayload = {
        type: commandType,
        value: command.toString(),
      };

      const message = {
        type: "ItemCommandEvent",
        topic: `openhab/items/${itemName}/command`,
        payload: JSON.stringify(commandPayload), // Payload must be a JSON string
      };
      this.ws.send(JSON.stringify(message));
      logger.debug(
        `Sent command to ${itemName}: ${JSON.stringify(commandPayload)}`
      );
    } else {
      throw new Error("WebSocket not connected");
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export convenience functions for backward compatibility
export const registerWebSocketListener =
  WebSocketService.registerListener.bind(WebSocketService);
export const subscribeWebSocketListener =
  WebSocketService.subscribe.bind(WebSocketService);
export const initializeWebSocket =
  WebSocketService.initialize.bind(WebSocketService);
export const disconnectWebSocket =
  WebSocketService.disconnect.bind(WebSocketService);
export const webSocketManager = WebSocketService; // For backward compatibility
