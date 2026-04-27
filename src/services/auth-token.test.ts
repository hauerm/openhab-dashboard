import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredOpenHABToken,
  getOpenHABRuntimeToken,
  getStoredOpenHABToken,
  setStoredOpenHABToken,
  validateOpenHABToken,
} from "./auth-token";

describe("auth-token", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    clearStoredOpenHABToken();
    vi.restoreAllMocks();
  });

  it("stores, reads, and clears the openHAB token cookie", () => {
    setStoredOpenHABToken(" token-with-spaces ");

    expect(getStoredOpenHABToken()).toBe("token-with-spaces");

    clearStoredOpenHABToken();

    expect(getStoredOpenHABToken()).toBeNull();
  });

  it("rejects empty stored tokens", () => {
    expect(() => setStoredOpenHABToken("   ")).toThrow(
      "openHAB API token must not be empty."
    );
  });

  it("uses the env token only as a dev fallback", () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_OPENHAB_API_TOKEN", "dev-token");

    expect(getOpenHABRuntimeToken()).toBe("dev-token");

    vi.stubEnv("DEV", false);

    expect(getOpenHABRuntimeToken()).toBeNull();
  });

  it("rejects blank tokens before validating with openHAB", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(validateOpenHABToken("   ")).rejects.toThrow(
      "Bitte openHAB API Token eingeben."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates a token against the openHAB items endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await validateOpenHABToken("runtime-token");

    expect(fetchMock).toHaveBeenCalledWith("/api/items?recursive=false", {
      headers: {
        Authorization: "Bearer runtime-token",
      },
    });
  });
});
