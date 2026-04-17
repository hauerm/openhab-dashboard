import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "./types/item";
import {
  KNX_Wetterstation_Regen,
  KNX_Wetterstation_Helligkeit,
  KNX_JA1_Raffstore_Wohnzimmer,
  KNX_JA1_Raffstore_Wohnzimmer_Strasse,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
  Samsung_TV_Wohnzimmer_Application,
  Samsung_TV_Wohnzimmer_Kanal,
  Samsung_TV_Wohnzimmer_Kanalnummer,
  Samsung_TV_Wohnzimmer_Power,
  Samsung_TV_Wohnzimmer_Titel,
  Shelly_Plug_Wohnzimmer_Betrieb,
  Shelly_Plug_Wohnzimmer_Stromverbrauch,
} from "./domain/hauer-items";
import { resetViewStoreForTests } from "./stores/viewStore";
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
      Property_Illuminance: 1800,
      Property_AirQuality_CO2: 810,
      Property_AirQuality_AQI: 1,
    };

    const state = {
      initialize: mocks.locationPropertyInitialize,
      ensureHistoryRange: mocks.locationPropertyEnsureHistoryRange,
      currentValue: valueByProperty[config.property] ?? null,
      history: {},
      metadata: [],
      itemNames: new Set<string>([`${config.property}-item`]),
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
  type: Item["type"] = "Switch",
  label?: string
): Item => ({
  link: `/items/${name}`,
  state,
  editable: false,
  type,
  name,
  ...(label ? { label } : {}),
  tags: [],
  groupNames: [],
});

const buildDefaultItems = (): Item[] => [
  createItem("Hauer", "NULL", "Group", "Adresse Hauer"),
  createItem("EG", "NULL", "Group", "EG"),
  createItem("Wohnzimmer", "NULL", "Group", "Wohnzimmer"),
  createItem(KNX_Wetterstation_Regen, "OFF"),
  createItem(KNX_Wetterstation_Helligkeit, "1800 lx"),
  createItem(KNX_JA1_Raffstore_Wohnzimmer, "67", "Rollershutter"),
  createItem(KNX_JA1_Raffstore_Wohnzimmer_Strasse, "45", "Rollershutter"),
  createItem(SAH3_Licht_Couch, "ON"),
  createItem(SAH3_Licht_TV, "35", "Dimmer"),
  createItem(Samsung_TV_Wohnzimmer_Power, "ON"),
  createItem(Samsung_TV_Wohnzimmer_Application, "NULL", "String"),
  createItem(Samsung_TV_Wohnzimmer_Kanal, "ORF 1", "String"),
  createItem(Samsung_TV_Wohnzimmer_Kanalnummer, "1", "String"),
  createItem(Samsung_TV_Wohnzimmer_Titel, "ZIB", "String"),
  createItem(Shelly_Plug_Wohnzimmer_Betrieb, "ON"),
  createItem(Shelly_Plug_Wohnzimmer_Stromverbrauch, "24.3 W", "Number:Power"),
];

describe("App integration", () => {
  beforeEach(() => {
    resetViewStoreForTests();
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

    const background = screen.getByTestId("view-background-image");
    expect(background).toHaveAttribute(
      "src",
      expect.stringContaining("/views/house/base.webp")
    );
    await waitFor(() => {
      expect(background).toHaveAttribute("alt", "Adresse Hauer Kontextfoto");
      expect(screen.getByTestId("dock-button-house")).toHaveTextContent(
        "Adresse Hauer"
      );
    });
    expect(screen.getByTestId("bottom-dock-panel")).toHaveAttribute(
      "data-visible",
      "true"
    );
    expect(screen.getByTestId("dock-button-eg")).toBeInTheDocument();
    expect(screen.getByTestId("dock-button-living")).toBeInTheDocument();
    expect(screen.getByTestId("view-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-temp")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-humidity")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-illuminance")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-illuminance")).toHaveAttribute(
      "data-illuminance-state",
      "soft"
    );
    expect(
      screen.getByTestId("hud-metric-illuminance-display-icon")
    ).toBeInTheDocument();
    expect(screen.queryByText("1.800 lx")).not.toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-co2")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-health")).toBeInTheDocument();
  });

  it("switches views and updates the view background + hud", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("dock-button-eg"));

    const background = screen.getByTestId("view-background-image");
    expect(background).toHaveAttribute(
      "src",
      expect.stringContaining("/views/house/eg/base.webp")
    );
    expect(screen.getByTestId("hud-metric-temp")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-humidity")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-illuminance")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-co2")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-health")).toBeInTheDocument();
  });

  it("hides the bottom dock when clicking outside it", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    expect(screen.getByTestId("dock-button-eg")).toBeInTheDocument();

    await user.click(screen.getByTestId("view-background-image"));

    await waitFor(() => {
      expect(screen.getByTestId("bottom-dock-panel")).toHaveAttribute(
        "data-visible",
        "false"
      );
    });

    await user.click(screen.getByTestId("dock-expand-button"));

    await waitFor(() => {
      expect(screen.getByTestId("bottom-dock-panel")).toHaveAttribute(
        "data-visible",
        "true"
      );
    });
  });

  it("keeps the sidebar visible across location-backed views", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(mocks.fetchItemsMetadata).toHaveBeenCalled();
    });

    expect(screen.getByTestId("view-sidebar")).toBeInTheDocument();

    await user.click(screen.getByTestId("dock-button-living"));

    expect(screen.getByTestId("view-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-temp")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-illuminance")).toBeInTheDocument();
    expect(screen.getByTestId("hud-metric-health")).toBeInTheDocument();
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
    expect(screen.getByTestId("ventilation-overlay-status")).toHaveTextContent("Stufe 2");
    expect(screen.getByTestId("ventilation-overlay-mode")).toHaveTextContent("Automatik");
    expect(screen.getByTestId("ventilation-control-auto")).toBeInTheDocument();
    expect(screen.getByTestId("ventilation-control-manual-0")).toBeInTheDocument();
    expect(screen.getByTestId("ventilation-control-manual-4")).toBeInTheDocument();

    await user.click(screen.getByTestId("ventilation-control-manual-3"));
    expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
      "KNX_Helios_ManualMode",
      "3",
      "Decimal"
    );

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

    expect(screen.getByTestId("view-background-image")).toHaveAttribute(
      "src",
      expect.stringContaining("/views/house/eg/living/base.webp")
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
      screen.getByTestId(
        `living-control-placeholder-icon-${Shelly_Plug_Wohnzimmer_Betrieb}-power-on`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`living-control-tv-small-${Samsung_TV_Wohnzimmer_Power}`)
    ).toHaveTextContent("1 ORF 1");
    expect(
      screen.getByTestId(`living-control-tv-large-${Samsung_TV_Wohnzimmer_Power}`)
    ).toHaveTextContent("ZIB");
    expect(
      screen.getByTestId(`living-control-power-large-${Shelly_Plug_Wohnzimmer_Betrieb}`)
    ).toHaveTextContent("24,3 W");

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

    await user.click(
      screen.getByTestId(`living-control-placeholder-${Shelly_Plug_Wohnzimmer_Betrieb}`)
    );
    expect(
      screen.getByTestId(`living-power-overlay-state-${Shelly_Plug_Wohnzimmer_Betrieb}`)
    ).toHaveTextContent("Ein");
    expect(
      screen.getByTestId(
        `living-power-overlay-consumption-${Shelly_Plug_Wohnzimmer_Betrieb}`
      )
    ).toHaveTextContent("24,3 W");
    await user.click(
      screen.getByTestId(`living-power-overlay-power-${Shelly_Plug_Wohnzimmer_Betrieb}`)
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
      expect(mocks.websocketSendCommand).toHaveBeenCalledWith(
        Shelly_Plug_Wohnzimmer_Betrieb,
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
