// OpenHAB Configuration
export const OPENHAB_HOST = import.meta.env.VITE_OPENHAB_HOST || "localhost";
export const OPENHAB_PORT = import.meta.env.VITE_OPENHAB_PORT || "8080";
export const OPENHAB_PROTOCOL = import.meta.env.VITE_OPENHAB_PROTOCOL || "http"; // or 'https'
export const OPENHAB_INSECURE =
  import.meta.env.VITE_OPENHAB_INSECURE === "true"; // Allow insecure connections
export const OPENHAB_API_TOKEN = import.meta.env.VITE_OPENHAB_API_TOKEN;

// Use local proxy endpoints when in development to bypass SSL certificate validation
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
    }/ws?access_token=${OPENHAB_API_TOKEN}`;
  } else {
    // Direct connection in production
    const wsProtocol = OPENHAB_INSECURE
      ? "ws"
      : OPENHAB_PROTOCOL.replace("http", "ws");
    return `${wsProtocol}://${OPENHAB_HOST}:${OPENHAB_PORT}/ws?access_token=${OPENHAB_API_TOKEN}`;
  }
};

// Semantic property constants
export const PROPERTY_HUMIDITY = "Property_Humidity";
export const PROPERTY_TEMPERATURE = "Property_Temperature";
export const PROPERTY_CO2 = "Property_AirQuality_CO2";
export const PROPERTY_AIR_QUALITY = "Property_AirQuality_AQI";
