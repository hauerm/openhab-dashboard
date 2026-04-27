const OPENHAB_TOKEN_COOKIE = "openhab_dashboard_token";
const TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const getDefaultPort = (protocol: string): string =>
  protocol === "https" ? "9443" : "8080";

const getDevOpenHABToken = (): string | null => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const token = import.meta.env.VITE_OPENHAB_API_TOKEN?.trim();
  return token ? token : null;
};

const getOpenHABRestBaseUrl = (): string => {
  const protocol = (import.meta.env.VITE_OPENHAB_PROTOCOL || "http").toLowerCase();
  const host = import.meta.env.VITE_OPENHAB_HOST || "localhost";
  const port = import.meta.env.VITE_OPENHAB_PORT || getDefaultPort(protocol);
  const useProxy =
    import.meta.env.DEV || import.meta.env.VITE_OPENHAB_USE_PROXY !== "false";

  return useProxy ? "/api" : `${protocol}://${host}:${port}/rest`;
};

const hasDocumentCookie = (): boolean =>
  typeof document !== "undefined" && typeof document.cookie === "string";

export const getStoredOpenHABToken = (): string | null => {
  if (!hasDocumentCookie()) {
    return null;
  }

  const cookiePrefix = `${OPENHAB_TOKEN_COOKIE}=`;
  const tokenCookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(cookiePrefix));

  if (!tokenCookie) {
    return null;
  }

  try {
    const token = decodeURIComponent(tokenCookie.slice(cookiePrefix.length)).trim();
    return token ? token : null;
  } catch {
    return null;
  }
};

export const setStoredOpenHABToken = (token: string): void => {
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    throw new Error("openHAB API token must not be empty.");
  }
  if (!hasDocumentCookie()) {
    return;
  }

  const cookieAttributes = [
    `${OPENHAB_TOKEN_COOKIE}=${encodeURIComponent(trimmedToken)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${TOKEN_COOKIE_MAX_AGE_SECONDS}`,
  ];
  if (window.location.protocol === "https:") {
    cookieAttributes.push("Secure");
  }
  document.cookie = cookieAttributes.join("; ");
};

export const clearStoredOpenHABToken = (): void => {
  if (!hasDocumentCookie()) {
    return;
  }

  document.cookie = [
    `${OPENHAB_TOKEN_COOKIE}=`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
};

export const getOpenHABRuntimeToken = (): string | null =>
  getStoredOpenHABToken() ?? getDevOpenHABToken();

export const validateOpenHABToken = async (token: string): Promise<void> => {
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    throw new Error("Bitte openHAB API Token eingeben.");
  }

  const response = await fetch(
    `${getOpenHABRestBaseUrl()}/items?recursive=false`,
    {
      headers: {
        Authorization: `Bearer ${trimmedToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("openHAB API Token konnte nicht verifiziert werden.");
  }
};
