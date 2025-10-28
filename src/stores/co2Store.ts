import { create } from "zustand";
import type { Item } from "../types/item";
import {
  fetchItemsMetadata,
  filterItemsBySemanticProperty,
  PROPERTY_CO2,
  getItemHistory,
} from "../services/openhab-service";
import { registerWebSocketListener } from "../services/websocket-service";

interface HistoryPoint {
  timestamp: number;
  value: number;
}

interface CO2State {
  currentValue: number | null;
  history: Record<string, HistoryPoint[]>; // itemName -> history
  metadata: Item[];
  itemNames: Set<string>;
  loading: boolean;
  error: string | null;
}

interface CO2Actions {
  initialize: () => Promise<void>;
  updateValue: (itemName: string, value: number, timestamp?: number) => void;
  handleWebSocketMessage: (itemName: string, value: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getAveragedValue: () => number | null;
  getRecentHistory: (hours: number) => Record<string, HistoryPoint[]>;
}

export const useCO2Store = create<CO2State & CO2Actions>((set, get) => ({
  currentValue: null,
  history: {},
  metadata: [],
  itemNames: new Set(),
  loading: false,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const items = await fetchItemsMetadata();
      const co2Items = filterItemsBySemanticProperty(items, PROPERTY_CO2);
      set({
        metadata: co2Items,
        itemNames: new Set(co2Items.map((i) => i.name)),
      });

      // Fetch historical data for the last 2 hours (includes current values)
      const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
      for (const item of co2Items) {
        try {
          const historyResponse = await getItemHistory(item.name, {
            starttime: twoHoursAgo,
          });
          const historyPoints = historyResponse.data
            .filter((dp) => !isNaN(parseFloat(dp.state)))
            .map((dp) => ({
              timestamp: dp.time,
              value: parseFloat(dp.state),
            }));

          // Add historical points (includes recent/current values)
          historyPoints.forEach((point) =>
            get().updateValue(item.name, point.value, point.timestamp)
          );
        } catch (error) {
          console.error(`Failed to fetch history for ${item.name}:`, error);
        }
      }
    } catch (error) {
      set({ error: "Failed to initialize CO2 data" });
      console.error("CO2 store initialization error:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateValue: (itemName, value, timestamp) => {
    const now = timestamp ?? Date.now();
    set((state) => {
      const newHistory = { ...state.history };
      if (!newHistory[itemName]) newHistory[itemName] = [];
      newHistory[itemName].push({ timestamp: now, value });
      // Keep only last 2 hours
      newHistory[itemName] = newHistory[itemName].filter(
        (p) => now - p.timestamp < 7200000
      );

      // Calculate average
      const currentValues = Object.values(newHistory)
        .map((arr) => arr[arr.length - 1]?.value)
        .filter((v) => v != null);
      const avg =
        currentValues.length > 0
          ? currentValues.reduce((a, b) => a + b, 0) / currentValues.length
          : null;

      return {
        history: newHistory,
        currentValue: avg,
      };
    });
  },

  handleWebSocketMessage: (itemName, value) => {
    if (get().itemNames.has(itemName)) {
      get().updateValue(itemName, value);
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getAveragedValue: () => get().currentValue,

  getRecentHistory: (hours) => {
    const now = Date.now();
    const cutoff = now - hours * 3600000;
    const state = get();
    const filtered: Record<string, HistoryPoint[]> = {};
    for (const [item, points] of Object.entries(state.history)) {
      filtered[item] = points.filter((p) => p.timestamp >= cutoff);
    }
    return filtered;
  },
}));

(async () => {
  await useCO2Store.getState().initialize();
  registerWebSocketListener((itemName, value) =>
    useCO2Store.getState().handleWebSocketMessage(itemName, value)
  );
})();
