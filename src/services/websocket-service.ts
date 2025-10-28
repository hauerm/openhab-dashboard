import { toast } from "react-toastify";
import { getWebSocketUrl } from "./config";

interface ItemStatePayload {
  type: string;
  value: string;
}

/**
 * Service for handling OpenHAB WebSocket connections and real-time updates
 */
export class WebSocketService {
  private static listeners: Array<(itemName: string, value: number) => void> = [];
  private static manager: WebSocketManager | null = null;

  /**
   * Register a listener for WebSocket item state changes
   */
  static registerListener(listener: (itemName: string, value: number) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Initialize the WebSocket connection
   */
  static async initialize(): Promise<void> {
    try {
      if (!this.manager) {
        this.manager = new WebSocketManager();
      }

      this.manager.connect((event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === "ItemStateEvent" ||
            data.type === "ItemStateChangedEvent"
          ) {
            const itemName = data.topic.split("/")[2];
            const payload = JSON.parse(data.payload) as ItemStatePayload;
            const state = payload.value;
            const value = parseFloat(state);
            if (isNaN(value)) return;

            // Dispatch to all registered listeners
            this.listeners.forEach((listener) => listener(itemName, value));
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      });
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      toast.error("Failed to initialize WebSocket connection.");
    }
  }

  /**
   * Disconnect the WebSocket connection
   */
  static disconnect(): void {
    if (this.manager) {
      this.manager.disconnect();
      this.manager = null;
    }
  }

  /**
   * Get the current connection status
   */
  static isConnected(): boolean {
    return this.manager?.isConnected() ?? false;
  }
}

/**
 * WebSocket manager with retry logic and connection management
 */
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
  ): void {
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError || null;
    this.attemptConnection();
  }

  private attemptConnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error(
        "Failed to connect to OpenHAB WebSocket after multiple attempts."
      );
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);

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

      this.ws.onclose = (event) => {
        console.log(
          `WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`
        );
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
      console.error("Failed to create WebSocket:", error);
      toast.error(
        "Failed to create WebSocket connection. Check your OpenHAB configuration."
      );
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay *= 2; // Exponential backoff
      this.attemptConnection();
    }, this.reconnectDelay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export convenience functions for backward compatibility
export const registerWebSocketListener = WebSocketService.registerListener.bind(WebSocketService);
export const initializeWebSocket = WebSocketService.initialize.bind(WebSocketService);
export const webSocketManager = WebSocketService; // For backward compatibility