import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOpenHABAuthHeaders, getWebSocketSubprotocols } from "./config";
import { getOpenHABRuntimeToken } from "./auth-token";

vi.mock("./auth-token", () => ({
  getOpenHABRuntimeToken: vi.fn(),
}));

const getRuntimeTokenMock = vi.mocked(getOpenHABRuntimeToken);

describe("openHAB config auth helpers", () => {
  beforeEach(() => {
    getRuntimeTokenMock.mockReset();
  });

  it("adds the bearer token to REST headers when a runtime token exists", () => {
    getRuntimeTokenMock.mockReturnValue("runtime-token");

    expect(getOpenHABAuthHeaders({ Accept: "application/json" })).toEqual({
      Authorization: "Bearer runtime-token",
      Accept: "application/json",
    });
  });

  it("returns existing REST headers unchanged without a runtime token", () => {
    getRuntimeTokenMock.mockReturnValue(null);

    expect(getOpenHABAuthHeaders({ Accept: "application/json" })).toEqual({
      Accept: "application/json",
    });
  });

  it("adds the openHAB access-token WebSocket subprotocol when a token exists", () => {
    getRuntimeTokenMock.mockReturnValue("runtime-token");

    expect(getWebSocketSubprotocols()).toEqual([
      "org.openhab.ws.accessToken.base64.cnVudGltZS10b2tlbg",
      "org.openhab.ws.protocol.default",
    ]);
  });

  it("uses only the default WebSocket subprotocol without a token", () => {
    getRuntimeTokenMock.mockReturnValue(null);

    expect(getWebSocketSubprotocols()).toEqual([
      "org.openhab.ws.protocol.default",
    ]);
  });
});
