import { create } from "zustand";
import type { Item } from "../types/item";
import type { HeliosManualLevel } from "../types/ventilation";
import { Point } from "../types/generated-items";
import { fetchItemsMetadata } from "../services/openhab-service";

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
  updateValue: (itemName: string, value: number) => void;
  handleWebSocketMessage: (itemName: string, value: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getManualLevel: () => HeliosManualLevel | null;
  getActualLevel: () => HeliosManualLevel | null;
}

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
    console.log("[Ventilation] Initializing ventilation store...");
    try {
      set({ loading: true, error: null });
      const items = await fetchItemsMetadata();
      console.log(`[Ventilation] Fetched ${items.length} items from OpenHAB`);

      // Find the Helios manual mode and operating level items
      const manualModeItem = items.find(
        (item) => item.name === Point.Setpoint.KNX_Helios_ManualMode
      );
      const operatingLevelItem = items.find(
        (item) => item.name === Point.Status.KNX_Helios_KWRL_Ist_Stufe
      );

      const foundItems = [];
      if (manualModeItem) {
        console.log(
          `[Ventilation] Found manual mode item: ${manualModeItem.name}`
        );
        foundItems.push(manualModeItem);
      } else {
        console.warn("[Ventilation] Helios manual mode item not found");
      }

      if (operatingLevelItem) {
        console.log(
          `[Ventilation] Found operating level item: ${operatingLevelItem.name}`
        );
        foundItems.push(operatingLevelItem);
      } else {
        console.warn("[Ventilation] Helios operating level item not found");
      }

      if (foundItems.length > 0) {
        set({
          metadata: foundItems,
          itemNames: new Set(foundItems.map((item) => item.name)),
        });

        // Get current states from the items
        console.log("[Ventilation] Getting current states...");
        try {
          if (manualModeItem) {
            const manualState = parseFloat(manualModeItem.state);
            if (!isNaN(manualState)) {
              console.log(`[Ventilation] Initial manual level: ${manualState}`);
              set({ manualLevel: manualState as HeliosManualLevel });
            }
          }

          if (operatingLevelItem) {
            const operatingState = parseFloat(operatingLevelItem.state);
            if (!isNaN(operatingState)) {
              console.log(
                `[Ventilation] Initial operating level: ${operatingState}`
              );
              set({ actualLevel: operatingState as HeliosManualLevel });
            }
          }
        } catch (error) {
          console.error(`[Ventilation] Failed to parse current states:`, error);
        }
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
    const previousManualLevel = get().manualLevel;
    const previousActualLevel = get().actualLevel;

    // Update manual level from the manual mode setpoint
    const manualLevel =
      itemName === Point.Setpoint.KNX_Helios_ManualMode
        ? (value as HeliosManualLevel)
        : get().manualLevel;

    // Update actual level from the operating level status
    const actualLevel =
      itemName === Point.Status.KNX_Helios_KWRL_Ist_Stufe
        ? (value as HeliosManualLevel)
        : get().actualLevel;

    if (manualLevel !== previousManualLevel) {
      console.log(
        `[Ventilation] Manual level changed: ${previousManualLevel} → ${manualLevel}`
      );
    }

    if (actualLevel !== previousActualLevel) {
      console.log(
        `[Ventilation] Actual level changed: ${previousActualLevel} → ${actualLevel}`
      );
    }

    console.log(`[Ventilation] Updated ${itemName}: ${value}`);
    set({ manualLevel, actualLevel });
  },

  handleWebSocketMessage: (itemName, value) => {
    if (get().itemNames.has(itemName)) {
      console.log(`[Ventilation] WebSocket update: ${itemName} = ${value}`);
      get().updateValue(itemName, value);
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

  getManualLevel: () => {
    const level = get().manualLevel;
    console.log(`[Ventilation] Manual level requested: ${level}`);
    return level;
  },

  getActualLevel: () => {
    const level = get().actualLevel;
    console.log(`[Ventilation] Actual level requested: ${level}`);
    return level;
  },
}));

// Store is now initialized explicitly by components when needed
