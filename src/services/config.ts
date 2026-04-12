// OpenHAB Configuration
export const OPENHAB_HOST = import.meta.env.VITE_OPENHAB_HOST || "localhost";
export const OPENHAB_PROTOCOL =
  (import.meta.env.VITE_OPENHAB_PROTOCOL || "http").toLowerCase();
export const OPENHAB_INSECURE = import.meta.env.VITE_OPENHAB_INSECURE === "true";
export const OPENHAB_API_TOKEN = import.meta.env.VITE_OPENHAB_API_TOKEN;

const getDefaultPort = (protocol: string): string =>
  protocol === "https" ? "9443" : "8080";

const configuredPort =
  import.meta.env.VITE_OPENHAB_PORT || getDefaultPort(OPENHAB_PROTOCOL);

// Keep configured protocol/port as-is. In development, TLS verification handling
// is controlled by Vite proxy (`server.proxy.*.secure`), not by rewriting port/protocol.
export const OPENHAB_PORT = configuredPort;

export const getOpenHABAuthHeaders = (
  headers: Record<string, string> = {}
): Record<string, string> => {
  if (!OPENHAB_API_TOKEN) {
    return headers;
  }
  return {
    Authorization: `Bearer ${OPENHAB_API_TOKEN}`,
    ...headers,
  };
};

export const getWebSocketSubprotocols = (): string[] => {
  const protocols = ["org.openhab.ws.protocol.default"];
  if (!OPENHAB_API_TOKEN) {
    return protocols;
  }

  try {
    const encodedToken = btoa(OPENHAB_API_TOKEN).replace(/=*$/, "");
    return [`org.openhab.ws.accessToken.base64.${encodedToken}`, ...protocols];
  } catch {
    return protocols;
  }
};

// Use local proxy endpoints in development to bypass SSL certificate validation
const isDevelopment = import.meta.env.DEV;
export const OPENHAB_BASE_URL = isDevelopment
  ? "/api"
  : `${OPENHAB_PROTOCOL}://${OPENHAB_HOST}:${OPENHAB_PORT}/rest`;

// Function to get WebSocket URL dynamically
export const getWebSocketUrl = (): string => {
  if (isDevelopment && typeof window !== "undefined") {
    // Use local proxy in development
    return `${window.location.protocol.replace("http", "ws")}//${
      window.location.host
    }/ws`;
  }

  // Direct connection in production
  const wsProtocol = OPENHAB_PROTOCOL.replace("http", "ws");
  return `${wsProtocol}://${OPENHAB_HOST}:${OPENHAB_PORT}/ws`;
};
