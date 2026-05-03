import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebSocketService } from "./websocket-service";

vi.mock("react-toastify", () => ({
  toast: {
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("./auth-token", () => ({
  getOpenHABRuntimeToken: vi.fn(() => "runtime-token"),
}));

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  readyState = MockWebSocket.CONNECTING;
  readonly url: string;
  readonly protocols?: string[];

  constructor(url: string, protocols?: string[]) {
    this.url = url;
    this.protocols = protocols;
    MockWebSocket.instances.push(this);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
  }

  send(): void {}
}

const setNavigatorOnline = (online: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    value: online,
    configurable: true,
  });
};

const setDocumentVisibility = (visibilityState: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    value: visibilityState,
    configurable: true,
  });
};

describe("WebSocketService startup behavior", () => {
  const OriginalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    WebSocketService.disconnect();
    vi.stubGlobal("WebSocket", MockWebSocket);
    Object.assign(MockWebSocket, {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    });
    setNavigatorOnline(true);
    setDocumentVisibility("visible");
  });

  afterEach(() => {
    WebSocketService.disconnect();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    globalThis.WebSocket = OriginalWebSocket;
  });

  it("delays the initial WebSocket connection briefly", async () => {
    await WebSocketService.initialize();

    expect(MockWebSocket.instances).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(749);
    expect(MockWebSocket.instances).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(1);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe("ws://localhost:3000/ws");
  });

  it("waits until the page is visible before opening the WebSocket", async () => {
    setDocumentVisibility("hidden");

    await WebSocketService.initialize();
    await vi.advanceTimersByTimeAsync(750);

    expect(MockWebSocket.instances).toHaveLength(0);

    setDocumentVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("waits until the browser is online before opening the WebSocket", async () => {
    setNavigatorOnline(false);

    await WebSocketService.initialize();
    await vi.advanceTimersByTimeAsync(750);

    expect(MockWebSocket.instances).toHaveLength(0);

    setNavigatorOnline(true);
    window.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);

    expect(MockWebSocket.instances).toHaveLength(1);
  });
});
