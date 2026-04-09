import { create } from "zustand";
import type { Item } from "../types/item";
import type { HeliosManualLevel } from "../types/ventilation";
import {
  HELIOS_ACTUAL_LEVEL_ITEM,
  HELIOS_MANUAL_MODE_ITEM,
} from "../types/ventilation";
import { fetchItemsMetadata } from "../services/openhab-service";
import { log } from "../services/logger";
import type { WebSocketItemUpdate } from "../services/websocket-service";
import { subscribeWebSocketListener } from "../services/websocket-service";
import { parseOpenHABState } from "../services/state-parser";

const logger = log.createLogger("Ventilation");

interface VentilationState {
  manualLevel: HeliosManualLevel | null; // Manual mode setpoint
  actualLevel: HeliosManualLevel | null; // Actual operating level
  metadata: Item[];
  itemNames: Set<string>;
  loading: boolean;
  error: string | null;
}

interface VentilationActions {
  initialize: () => Promise<void>;
  updateValue: (itemName: string, value: number | null) => void;
  handleWebSocketMessage: (update: WebSocketItemUpdate) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getManualLevel: () => HeliosManualLevel | null;
  getActualLevel: () => HeliosManualLevel | null;
}

const trackedVentilationItems = [
  HELIOS_MANUAL_MODE_ITEM,
  HELIOS_ACTUAL_LEVEL_ITEM,
] as const;
const trackedVentilationItemSet = new Set<string>(trackedVentilationItems);

let initializePromise: Promise<void> | null = null;
let unsubscribeWebSocket: (() => void) | null = null;
let hasInitialized = false;

export const useVentilationStore = create<
  VentilationState & VentilationActions
>((set, get) => ({
  manualLevel: null,
  actualLevel: null,
  metadata: [],
  itemNames: new Set(),
  loading: false,
  error: null,

  initialize: async () => {
    if (hasInitialized) {
      return;
    }
    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      logger.info("Initializing ventilation store...");
      try {
        set({ loading: true, error: null });
        const items = await fetchItemsMetadata();
        logger.debug(`Fetched ${items.length} items from OpenHAB`);

        const foundItems = items.filter((item) =>
          trackedVentilationItemSet.has(item.name)
        );

        if (foundItems.length === 0) {
          logger.warn("No tracked ventilation items found");
          set({
            error:
              "Ventilation items not found. Please check item names in the semantic model.",
          });
          return;
        }

        const itemNames = new Set(foundItems.map((item) => item.name));
        set({
          metadata: foundItems,
          itemNames,
        });

        for (const item of foundItems) {
          const parsed = parseOpenHABState(item.state);
          get().updateValue(item.name, parsed.numericValue);
        }

        if (!unsubscribeWebSocket) {
          unsubscribeWebSocket = subscribeWebSocketListener(
            (update) => get().handleWebSocketMessage(update),
            { itemNames }
          );
        }

        hasInitialized = true;
        logger.info("Ventilation store initialization completed");
      } catch (error) {
        set({ error: "Failed to initialize ventilation data" });
        logger.error("Ventilation initialization error:", error);
      } finally {
        set({ loading: false });
      }
    })();

    try {
      await initializePromise;
    } finally {
      initializePromise = null;
    }
  },

  updateValue: (itemName, value) => {
    const previousManualLevel = get().manualLevel;
    const previousActualLevel = get().actualLevel;

    const nextManualLevel =
      itemName === HELIOS_MANUAL_MODE_ITEM
        ? (value as HeliosManualLevel | null)
        : previousManualLevel;

    const nextActualLevel =
      itemName === HELIOS_ACTUAL_LEVEL_ITEM
        ? (value as HeliosManualLevel | null)
        : previousActualLevel;

    if (nextManualLevel !== previousManualLevel) {
      logger.info(
        `Manual level changed: ${previousManualLevel} -> ${nextManualLevel}`
      );
    }

    if (nextActualLevel !== previousActualLevel) {
      logger.info(
        `Actual level changed: ${previousActualLevel} -> ${nextActualLevel}`
      );
    }

    set({ manualLevel: nextManualLevel, actualLevel: nextActualLevel });
  },

  handleWebSocketMessage: (update) => {
    if (!get().itemNames.has(update.itemName)) {
      return;
    }
    get().updateValue(update.itemName, update.numericValue);
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  getManualLevel: () => get().manualLevel,
  getActualLevel: () => get().actualLevel,
}));
