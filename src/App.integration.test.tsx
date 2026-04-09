import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "./types/item";
import {
  KNX_SAH2_Licht_Einfahrt,
  KNX_SAH2_Licht_Eingang,
  KNX_SAH2_Licht_Terrasse_Saulen,
  KNX_SAH2_Licht_Terrasse_Wand,
  SAH1_Stromerkennung_Licht_Esstisch,
  SAH1_Stromerkennung_Licht_Speis,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
  SHA1_Stromerkennung_Licht_Kuche,
  KNX_Wetterstation_Aussentemperatur,
  KNX_Wetterstation_Regen,
  KNX_Wetterstation_Helligkeit,
  Astro_Sun_Data_Sonnenphase,
} from "openhab-hauer-items/items";
import { resetSceneStoreCoreForTests } from "./stores/sceneStoreCore";
import App from "./App";

type SelectorHook<TState> = <TSelected>(
  selector: (state: TState) => TSelected
) => TSelected;

const mocks = vi.hoisted(() => ({
  fetchItemsMetadata: vi.fn(),
  subscribeWebSocketListener: vi.fn(),
  initializeWebSocket: vi.fn(),
  disconnectWebSocket: vi.fn(),
  semanticInitialize: vi.fn(),
  ventilationInitialize: vi.fn(),
  wsListener: null as ((update: { itemName: string; rawState: string }) => void) | null,
}));

vi.mock("./services/openhab-service", () => ({
  fetchItemsMetadata: mocks.fetchItemsMetadata,
}));

vi.mock("./services/websocket-service", () => ({
  initializeWebSocket: mocks.initializeWebSocket,
  disconnectWebSocket: mocks.disconnectWebSocket,
  subscribeWebSocketListener: mocks.subscribeWebSocketListener,
}));

vi.mock("./stores/semanticStore", () => ({
  createSemanticStore: (config: { property: string }) => {
    const valueByProperty: Record<string, number> = {
      Property_Temperature: 22.4,
      Property_Humidity: 51,
      Property_AirQuality_CO2: 810,
      Property_AirQuality_AQI: 1,
    };

    const state = {
      initialize: mocks.semanticInitialize,
      currentValue: valueByProperty[config.property] ?? null,
      history: {},
      metadata: [],
      itemNames: new Set<string>(),
      latestValues: {},
      latestRawStates: {},
      latestStateKinds: {},
      loading: false,
      error: null,
      currentValueStatus: "ready" as const,
    };

    const hook: SelectorHook<typeof state> = (selector) => selector(state);
    return hook;
  },
}));

vi.mock("./stores/ventilationStore", () => {
  const state = {
    manualLevel: -1 as const,
    actualLevel: 2 as const,
    initialize: mocks.ventilationInitialize,
  };

  const useVentilationStore: SelectorHook<typeof state> = (selector) =>
    selector(state);

  return { useVentilationStore };
});

vi.mock("./components/SemanticHistoryChartView", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="semantic-history-overlay">{title}</div>
  ),
}));

vi.mock("./components/HeliosManualModeToggle", () => ({
  default: () => <div data-testid="ventilation-overlay">Ventilation overlay</div>,
}));

const createItem = (name: string, state: string): Item => ({
  link: `/items/${name}`,
  state,
  editable: false,
  type: "Switch",
  name,
  tags: [],
  groupNames: [],
});

const buildDefaultItems = (): Item[] => [
  createItem(KNX_SAH2_Licht_Einfahrt, "OFF"),
  createItem(KNX_SAH2_Licht_Eingang, "OFF"),
  createItem(KNX_SAH2_Licht_Terrasse_Wand, "OFF"),
  createItem(KNX_SAH2_Licht_Terrasse_Saulen, "OFF"),
  createItem(SHA1_Stromerkennung_Licht_Kuche, "OFF"),
  createItem(SAH1_Stromerkennung_Licht_Esstisch, "OFF"),
  createItem(SAH1_Stromerkennung_Licht_Speis, "OFF"),
  createItem(SAH3_Licht_Couch, "OFF"),
  createItem(SAH3_Licht_TV, "OFF"),
  createItem(KNX_Wetterstation_Aussentemperatur, "14.2 °C"),
  createItem(KNX_Wetterstation_Regen, "OFF"),
  createItem(KNX_Wetterstation_Helligkeit, "1800 lx"),
  createItem(Astro_Sun_Data_Sonnenphase, "DAY"),
];

describe("App integration", () => {
  beforeEach(() => {
    resetSceneStoreCoreForTests();
    mocks.wsListener = null;

    mocks.fetchItemsMetadata.mockReset();
    mocks.fetchItemsMetadata.mockResolvedValue(buildDefaultItems());

    mocks.initializeWebSocket.mockReset();
    mocks.initializeWebSocket.mockResolvedValue(undefined);

    mocks.disconnectWebSocket.mockReset();
    mocks.semanticInitialize.mockReset();
    mocks.semanticInitialize.mockResolvedValue(undefined);
    mocks.ventilationInitialize.mockReset();
    mocks.ventilationInitialize.mockResolvedValue(undefined);

    mocks.subscribeWebSocketListener.mockReset();
    mocks.subscribeWebSocketListener.mockImplementation((listener) => {
      mocks.wsListener = listener;
      return () => {
        mocks.wsListener = null;
      };
    });
  });

  it("loads initial state and renders house view without interaction", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalledTimes(1);
    });

    const background = screen.getByTestId("scene-background-image");
    expect(background).toHaveAttribute(
      "src",
      expect.stringContaining("/scenes/house/light-off.jpg")
    );
    expect(screen.getByTestId("dock-button-house")).toBeInTheDocument();
    expect(screen.getByTestId("dock-button-eg")).toBeInTheDocument();
  });

  it("switches views and updates scene background + hud", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-eg"));

    const background = screen.getByTestId("scene-background-image");
    expect(background).toHaveAttribute(
      "src",
      expect.stringContaining("/scenes/eg/light-off.jpg")
    );
    expect(screen.getByTestId("hud-metric-temp")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-humidity")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-co2")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-health")).toBeInTheDocument();
  });

  it("reacts live to websocket scene item updates", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mocks.wsListener).toBeTypeOf("function");
    });

    act(() => {
      mocks.wsListener?.({
        itemName: KNX_SAH2_Licht_Einfahrt,
        rawState: "ON",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("scene-background-image")).toHaveAttribute(
        "src",
        expect.stringContaining("/scenes/house/light-on.jpg")
      );
    });
  });

  it("opens and closes semantic overlay from eg hud click", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-eg"));
    await user.click(screen.getByTestId("hud-metric-temp"));

    expect(screen.getByTestId("semantic-history-overlay")).toBeInTheDocument();

    await user.click(screen.getByTestId("overlay-backdrop"));
    expect(
      screen.queryByTestId("semantic-history-overlay")
    ).not.toBeInTheDocument();
  });

  it("opens and closes ventilation overlay from gear hud click", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-eg"));
    await user.click(screen.getByTestId("hud-metric-ventilation"));

    expect(screen.getByTestId("ventilation-overlay")).toBeInTheDocument();

    await user.click(screen.getByTestId("overlay-backdrop"));
    expect(screen.queryByTestId("ventilation-overlay")).not.toBeInTheDocument();
  });

  it("opens history overlay for humidity metric", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-eg"));
    await user.click(screen.getByTestId("hud-metric-humidity"));

    expect(screen.getByTestId("semantic-history-overlay")).toBeInTheDocument();
  });
});
