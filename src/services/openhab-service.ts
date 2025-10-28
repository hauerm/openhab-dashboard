// Re-export everything from the new modular services for backward compatibility
export * from "./config";
export * from "./item-service";
export * from "./websocket-service";

// Legacy exports for backward compatibility - import first, then use
import { getWebSocketUrl } from "./config";
export const OPENHAB_WS_URL = getWebSocketUrl(); // For backward compatibility

// Legacy WebSocket functions
export function connectWebSocket(
  onMessage: (event: MessageEvent) => void,
  onError?: (error: Event) => void
): WebSocket {
  const ws = new WebSocket(getWebSocketUrl());
  ws.onmessage = onMessage;
  if (onError) ws.onerror = onError;
  return ws;
}
