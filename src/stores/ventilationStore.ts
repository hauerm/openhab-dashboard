import { create } from "zustand";
import type { Item } from "../types/item";
import type { HeliosManualLevel } from "../types/ventilation";
import { Point } from "../types/generated-items";
import { fetchItemsMetadata } from "../services/openhab-service";

interface VentilationState {
  currentLevel: HeliosManualLevel | null;
  metadata: Item[];
  itemNames: Set<string>;
  loading: boolean;
  error: string | null;
}

interface VentilationActions {
  initialize: () => Promise<void>;
  updateValue: (itemName: string, value: number) => void;
  handleWebSocketMessage: (itemName: string, value: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCurrentLevel: () => HeliosManualLevel | null;
}

export const useVentilationStore = create<
  VentilationState & VentilationActions
>((set, get) => ({
  currentLevel: null,
  metadata: [],
  itemNames: new Set(),
  loading: false,
  error: null,

  initialize: async () => {
    console.log("[Ventilation] Initializing ventilation store...");
    try {
      set({ loading: true, error: null });
      const items = await fetchItemsMetadata();
      console.log(`[Ventilation] Fetched ${items.length} items from OpenHAB`);

      // Find the Helios manual mode item
      const manualModeItem = items.find(
        (item) => item.name === Point.Setpoint.KNX_Helios_ManualMode
      );

      if (manualModeItem) {
        console.log(
          `[Ventilation] Found manual mode item: ${manualModeItem.name}`
        );
        set({
          metadata: [manualModeItem],
          itemNames: new Set([manualModeItem.name]),
        });

        // Get current state from the item
        console.log("[Ventilation] Getting current state...");
        try {
          const currentState = parseFloat(manualModeItem.state);
          if (!isNaN(currentState)) {
            console.log(`[Ventilation] Initial level: ${currentState}`);
            set({ currentLevel: currentState as HeliosManualLevel });
          }
        } catch (error) {
          console.error(
            `[Ventilation] Failed to parse current state for ${manualModeItem.name}:`,
            error
          );
        }
      } else {
        console.warn("[Ventilation] Helios manual mode item not found");
      }
      console.log("[Ventilation] Initialization completed successfully");
    } catch (error) {
      set({ error: "Failed to initialize ventilation data" });
      console.error("[Ventilation] Initialization error:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateValue: (itemName, value) => {
    const previousLevel = get().currentLevel;

    // Update current level from the manual mode setpoint
    const currentLevel =
      itemName === Point.Setpoint.KNX_Helios_ManualMode
        ? (value as HeliosManualLevel)
        : get().currentLevel;

    if (currentLevel !== previousLevel) {
      console.log(
        `[Ventilation] Current level changed: ${previousLevel} → ${currentLevel}`
      );
    }

    console.log(`[Ventilation] Updated ${itemName}: ${value}`);
    set({ currentLevel });
  },

  handleWebSocketMessage: (itemName, value) => {
    if (get().itemNames.has(itemName)) {
      console.log(`[Ventilation] WebSocket update: ${itemName} = ${value}`);
      get().updateValue(itemName, value);
    } else {
      console.log(
        `[Ventilation] Ignoring WebSocket update for unknown item: ${itemName}`
      );
    }
  },

  setLoading: (loading) => {
    console.log(`[Ventilation] Loading state changed: ${loading}`);
    set({ loading });
  },

  setError: (error) => {
    if (error) {
      console.error(`[Ventilation] Error set: ${error}`);
    } else {
      console.log("[Ventilation] Error cleared");
    }
    set({ error });
  },

  getCurrentLevel: () => {
    const level = get().currentLevel;
    console.log(`[Ventilation] Current level requested: ${level}`);
    return level;
  },
}));

// Store is now initialized explicitly by components when needed
