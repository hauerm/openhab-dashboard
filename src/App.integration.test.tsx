import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "./types/item";
import {
  KNX_Wetterstation_Aussentemperatur,
  KNX_Wetterstation_Regen,
  KNX_Wetterstation_Helligkeit,
  Astro_Sun_Data_Sonnenphase,
  KNX_JA1_Raffstore_Wohnzimmer,
  KNX_JA1_Raffstore_Wohnzimmer_Strasse,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
  Samsung_TV_Wohnzimmer_Application,
  Samsung_TV_Wohnzimmer_Kanal,
  Samsung_TV_Wohnzimmer_Kanalnummer,
  Samsung_TV_Wohnzimmer_Power,
  Samsung_TV_Wohnzimmer_Titel,
} from "openhab-hauer-items/items";
import { resetSceneStoreCoreForTests } from "./stores/sceneStoreCore";
import App from "./App";

type SelectorHook<TState> = <TSelected>(
  selector: (state: TState) => TSelected
) => TSelected;

const mocks = vi.hoisted(() => ({
  fetchItemsMetadata: vi.fn(),
  fetchItemMetadata: vi.fn(),
  upsertItemMetadata: vi.fn(),
  sendCommand: vi.fn(),
  subscribeWebSocketListener: vi.fn(),
  initializeWebSocket: vi.fn(),
  disconnectWebSocket: vi.fn(),
  websocketIsConnected: vi.fn(),
  websocketSendCommand: vi.fn(),
  locationPropertyInitialize: vi.fn(),
  locationPropertyEnsureHistoryRange: vi.fn(),
  ventilationInitialize: vi.fn(),
  ventilationSetError: vi.fn(),
  ventilationUpdateValue: vi.fn(),
  wsListener: null as ((update: { itemName: string; rawState: string }) => void) | null,
}));

vi.mock("./services/openhab-service", () => ({
  fetchItemsMetadata: mocks.fetchItemsMetadata,
  fetchItemMetadata: mocks.fetchItemMetadata,
  upsertItemMetadata: mocks.upsertItemMetadata,
  sendCommand: mocks.sendCommand,
}));

vi.mock("./services/websocket-service", () => ({
  initializeWebSocket: mocks.initializeWebSocket,
  disconnectWebSocket: mocks.disconnectWebSocket,
  subscribeWebSocketListener: mocks.subscribeWebSocketListener,
  WebSocketService: {
    isConnected: mocks.websocketIsConnected,
    sendCommand: mocks.websocketSendCommand,
  },
}));

vi.mock("./stores/locationPropertyHistoryStore", () => ({
  createLocationPropertyHistoryStore: (config: { property: string }) => {
    const valueByProperty: Record<string, number> = {
      Property_Temperature: 22.4,
      Property_Humidity: 51,
      Property_AirQuality_CO2: 810,
      Property_AirQuality_AQI: 1,
    };

    const state = {
      initialize: mocks.locationPropertyInitialize,
      ensureHistoryRange: mocks.locationPropertyEnsureHistoryRange,
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
    itemNames: new Set<string>(),
    initialize: mocks.ventilationInitialize,
    setError: mocks.ventilationSetError,
    updateValue: mocks.ventilationUpdateValue,
  };

  const useVentilationStore: SelectorHook<typeof state> = (selector) =>
    selector(state);

  return { useVentilationStore };
});
const createItem = (
  name: string,
  state: string,
  type: Item["type"] = "Switch"
): Item => ({
  link: `/items/${name}`,
  state,
  editable: false,
  type,
  name,
  tags: [],
  groupNames: [],
});

const buildDefaultItems = (): Item[] => [
  createItem(KNX_Wetterstation_Aussentemperatur, "14.2 °C"),
  createItem(KNX_Wetterstation_Regen, "OFF"),
  createItem(KNX_Wetterstation_Helligkeit, "1800 lx"),
  createItem(Astro_Sun_Data_Sonnenphase, "DAY"),
  createItem(KNX_JA1_Raffstore_Wohnzimmer, "67", "Rollershutter"),
  createItem(KNX_JA1_Raffstore_Wohnzimmer_Strasse, "45", "Rollershutter"),
  createItem(SAH3_Licht_Couch, "ON"),
  createItem(SAH3_Licht_TV, "35", "Dimmer"),
  createItem(Samsung_TV_Wohnzimmer_Power, "ON"),
  createItem(Samsung_TV_Wohnzimmer_Application, "NULL", "String"),
  createItem(Samsung_TV_Wohnzimmer_Kanal, "ORF 1", "String"),
  createItem(Samsung_TV_Wohnzimmer_Kanalnummer, "1", "String"),
  createItem(Samsung_TV_Wohnzimmer_Titel, "ZIB", "String"),
];

describe("App integration", () => {
  beforeEach(() => {
    resetSceneStoreCoreForTests();
    mocks.wsListener = null;

    mocks.fetchItemsMetadata.mockReset();
    mocks.fetchItemsMetadata.mockResolvedValue(buildDefaultItems());
    mocks.sendCommand.mockReset();
    mocks.sendCommand.mockResolvedValue(undefined);
    mocks.fetchItemMetadata.mockReset();
    mocks.fetchItemMetadata.mockResolvedValue(null);
    mocks.upsertItemMetadata.mockReset();
    mocks.upsertItemMetadata.mockResolvedValue(undefined);

    mocks.initializeWebSocket.mockReset();
    mocks.initializeWebSocket.mockResolvedValue(undefined);

    mocks.disconnectWebSocket.mockReset();
    mocks.websocketIsConnected.mockReset();
    mocks.websocketIsConnected.mockReturnValue(true);
    mocks.websocketSendCommand.mockReset();
    mocks.websocketSendCommand.mockResolvedValue(undefined);
    mocks.locationPropertyInitialize.mockReset();
    mocks.locationPropertyInitialize.mockResolvedValue(undefined);
    mocks.locationPropertyEnsureHistoryRange.mockReset();
    mocks.locationPropertyEnsureHistoryRange.mockResolvedValue(undefined);
    mocks.ventilationInitialize.mockReset();
    mocks.ventilationInitialize.mockResolvedValue(undefined);
    mocks.ventilationSetError.mockReset();
    mocks.ventilationUpdateValue.mockReset();

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
      expect.stringContaining("/scenes/house/base.webp")
    );
    expect(screen.getByTestId("dock-button-house")).toBeInTheDocument();
    expect(screen.getByTestId("dock-button-eg")).toBeInTheDocument();
    expect(screen.getByTestId("dock-button-living")).toBeInTheDocument();
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
      expect.stringContaining("/scenes/house/eg/base.webp")
    );
    expect(screen.getByTestId("hud-metric-temp")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-humidity")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-co2")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-health")).toBeInTheDocument();
  });

  it("reacts live to websocket hud item updates without changing base image", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mocks.wsListener).toBeTypeOf("function");
    });

    act(() => {
      mocks.wsListener?.({
        itemName: KNX_Wetterstation_Aussentemperatur,
        rawState: "19.0 °C",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("19.0 °C")).toBeInTheDocument();
      expect(screen.getByTestId("scene-background-image")).toHaveAttribute("src");
      expect(screen.getByTestId("scene-background-image")).toHaveAttribute(
        "src",
        expect.stringContaining("/scenes/house/base.webp")
      );
    });
  });

  it("opens and closes location-property overlay from eg hud click", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-eg"));
    await user.click(screen.getByTestId("hud-metric-temp"));

    expect(
      screen.getByTestId("location-property-history-control-overlay")
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("overlay-backdrop"));
    expect(
      screen.queryByTestId("location-property-history-control-overlay")
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

  it("closes ventilation overlay when clicking a free fullscreen background area", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-eg"));
    await user.click(screen.getByTestId("hud-metric-ventilation"));

    expect(screen.getByTestId("ventilation-overlay")).toBeInTheDocument();

    await user.click(screen.getByTestId("overlay-close-area"));
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

    expect(
      screen.getByTestId("location-property-history-control-overlay")
    ).toBeInTheDocument();
  });

  it("renders living controls and sends raffstore/light commands", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-living"));

    expect(screen.getByTestId("scene-background-image")).toHaveAttribute(
      "src",
      expect.stringContaining("/scenes/house/eg/living/base.webp")
    );
    expect(
      screen.queryByTestId(`raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}`)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`light-control-${SAH3_Licht_Couch}`)
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId(
        `living-control-placeholder-icon-${KNX_JA1_Raffstore_Wohnzimmer}-raffstore-half`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `living-control-placeholder-icon-${KNX_JA1_Raffstore_Wohnzimmer_Strasse}-raffstore-half`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `living-control-placeholder-icon-${SAH3_Licht_Couch}-light-on`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`living-control-placeholder-icon-${SAH3_Licht_TV}-light-on`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `living-control-placeholder-icon-${Samsung_TV_Wohnzimmer_Power}-tv-on`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`living-control-tv-small-${Samsung_TV_Wohnzimmer_Power}`)
    ).toHaveTextContent("1 ORF 1");
    expect(
      screen.getByTestId(`living-control-tv-large-${Samsung_TV_Wohnzimmer_Power}`)
    ).toHaveTextContent("ZIB");

    await user.click(
      screen.getByTestId(`living-control-placeholder-${KNX_JA1_Raffstore_Wohnzimmer}`)
    );
    expect(
      screen.getByTestId(`raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-value`)
    ).toHaveTextContent("67%");
    await user.click(
      screen.getByTestId(`raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-down`)
    );
    await user.click(
      screen.getByTestId(`raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-stop`)
    );
    await user.click(screen.getByTestId("overlay-backdrop"));

    await user.click(
      screen.getByTestId(
        `living-control-placeholder-${KNX_JA1_Raffstore_Wohnzimmer_Strasse}`
      )
    );
    expect(
      screen.getByTestId(
        `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer_Strasse}-value`
      )
    ).toHaveTextContent(
      "45%"
    );
    await user.click(
      screen.getByTestId(`raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer_Strasse}-up`)
    );
    await user.click(screen.getByTestId("overlay-backdrop"));

    await user.click(
      screen.getByTestId(`living-control-placeholder-${SAH3_Licht_Couch}`)
    );
    expect(
      screen.queryByTestId(`light-control-${SAH3_Licht_Couch}`)
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId(`living-control-placeholder-${SAH3_Licht_TV}`));
    expect(
      screen.queryByTestId(`light-control-${SAH3_Licht_TV}`)
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByTestId(`living-control-placeholder-${Samsung_TV_Wohnzimmer_Power}`)
    );
    expect(
      screen.getByTestId(`living-tv-overlay-power-${Samsung_TV_Wohnzimmer_Power}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`living-tv-overlay-state-${Samsung_TV_Wohnzimmer_Power}`)
    ).toHaveTextContent("1 ORF 1");
    expect(
      screen.getByTestId(`living-tv-overlay-content-${Samsung_TV_Wohnzimmer_Power}`)
    ).toHaveTextContent("ZIB");
    await user.click(
      screen.getByTestId(`living-tv-overlay-power-${Samsung_TV_Wohnzimmer_Power}`)
    );
    await user.click(screen.getByTestId("overlay-backdrop"));

    await waitFor(() => {
      expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
        KNX_JA1_Raffstore_Wohnzimmer,
        "DOWN",
        "UpDown"
      );
      expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
        KNX_JA1_Raffstore_Wohnzimmer,
        "STOP",
        "StopMove"
      );
      expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
        KNX_JA1_Raffstore_Wohnzimmer_Strasse,
        "UP",
        "UpDown"
      );
      expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
        SAH3_Licht_Couch,
        "OFF",
        "OnOff"
      );
      expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
        SAH3_Licht_TV,
        "OFF",
        "OnOff"
      );
      expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
        Samsung_TV_Wohnzimmer_Power,
        "OFF",
        "OnOff"
      );
    });
  });

  it("updates the living tv hud from program mode to streaming app logo", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-living"));

    act(() => {
      mocks.wsListener?.({
        itemName: Samsung_TV_Wohnzimmer_Application,
        rawState: "Netflix",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`living-control-tv-logo-${Samsung_TV_Wohnzimmer_Power}-netflix`)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`living-control-tv-small-${Samsung_TV_Wohnzimmer_Power}`)
    ).not.toBeInTheDocument();
  });

  it("closes fullscreen living overlays when clicking a free background area", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-living"));

    await user.click(
      screen.getByTestId(`living-control-placeholder-${KNX_JA1_Raffstore_Wohnzimmer}`)
    );
    expect(
      screen.getByTestId(`raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-value`)
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("overlay-close-area"));
    expect(
      screen.queryByTestId(`raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-value`)
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByTestId(`living-control-placeholder-${Samsung_TV_Wohnzimmer_Power}`)
    );
    expect(
      screen.getByTestId(`living-tv-overlay-power-${Samsung_TV_Wohnzimmer_Power}`)
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("overlay-close-area"));
    expect(
      screen.queryByTestId(`living-tv-overlay-power-${Samsung_TV_Wohnzimmer_Power}`)
    ).not.toBeInTheDocument();
  });

  it("runs RETROLux raffstore presets in overlay", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-living"));
    await user.click(
      screen.getByTestId(`living-control-placeholder-${KNX_JA1_Raffstore_Wohnzimmer}`)
    );

    const flush = async () => {
      await Promise.resolve();
      await Promise.resolve();
    };

    expect(
      screen.getByTestId(
        `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-preset-arbeitsstellung`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-preset-schliessen`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-preset-tilt-25`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-preset-tilt-50`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-preset-tilt-75`
      )
    ).toBeInTheDocument();

    vi.useFakeTimers();
    try {
      fireEvent.click(
        screen.getByTestId(
          `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-preset-schliessen`
        )
      );
      await flush();

      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        1,
        KNX_JA1_Raffstore_Wohnzimmer,
        "UP",
        "UpDown"
      );

      await vi.advanceTimersByTimeAsync(5_000);
      await flush();
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        2,
        KNX_JA1_Raffstore_Wohnzimmer,
        "STOP",
        "StopMove"
      );
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        3,
        KNX_JA1_Raffstore_Wohnzimmer,
        "DOWN",
        "UpDown"
      );

      await vi.advanceTimersByTimeAsync(5_000);
      await flush();
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        4,
        KNX_JA1_Raffstore_Wohnzimmer,
        "STOP",
        "StopMove"
      );

      fireEvent.click(
        screen.getByTestId(
          `raffstore-control-${KNX_JA1_Raffstore_Wohnzimmer}-preset-tilt-50`
        )
      );
      await flush();

      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        5,
        KNX_JA1_Raffstore_Wohnzimmer,
        "UP",
        "UpDown"
      );

      await vi.advanceTimersByTimeAsync(5_000);
      await flush();
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        6,
        KNX_JA1_Raffstore_Wohnzimmer,
        "STOP",
        "StopMove"
      );
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        7,
        KNX_JA1_Raffstore_Wohnzimmer,
        "DOWN",
        "UpDown"
      );

      await vi.advanceTimersByTimeAsync(5_000);
      await flush();
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        8,
        KNX_JA1_Raffstore_Wohnzimmer,
        "STOP",
        "StopMove"
      );
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        9,
        KNX_JA1_Raffstore_Wohnzimmer,
        "UP",
        "UpDown"
      );

      await vi.advanceTimersByTimeAsync(1_300);
      await flush();
      expect(mocks.websocketSendCommand).toHaveBeenNthCalledWith(
        10,
        KNX_JA1_Raffstore_Wohnzimmer,
        "STOP",
        "StopMove"
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
