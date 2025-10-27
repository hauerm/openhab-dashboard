import { webSocketManager } from "./openhab-service";
import { toast } from "react-toastify";

interface ItemStatePayload {
  type: string;
  value: string;
}

const listeners: Array<(itemName: string, value: number) => void> = [];

export const registerWebSocketListener = (
  listener: (itemName: string, value: number) => void
) => {
  listeners.push(listener);
};

export const initializeWebSocket = async () => {
  try {
    // Connect WebSocket
    webSocketManager.connect((event) => {
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
          listeners.forEach((listener) => listener(itemName, value));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });
  } catch (error) {
    console.error("Failed to initialize WebSocket:", error);
    toast.error("Failed to initialize WebSocket connection.");
  }
};
