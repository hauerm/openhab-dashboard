import { create } from "zustand";
import type { Item } from "../types/item";
import {
  fetchItemsMetadata,
  filterItemsBySemanticProperty,
  PROPERTY_AIR_QUALITY,
  getItemHistory,
} from "../services/openhab-service";
import { registerWebSocketListener } from "../services/webSocketService";

interface HistoryPoint {
  timestamp: number;
  value: number;
}

interface AQIState {
  currentValue: number | null;
  history: Record<string, HistoryPoint[]>; // itemName -> history
  metadata: Item[];
  itemNames: Set<string>;
  stateOptions: Record<string, string>; // value -> label mapping
  loading: boolean;
  error: string | null;
}

interface AQIActions {
  initialize: () => Promise<void>;
  updateValue: (itemName: string, value: number, timestamp?: number) => void;
  handleWebSocketMessage: (itemName: string, value: number) => void;
  getLabelForValue: (value: number) => string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getAveragedValue: () => number | null;
  getRecentHistory: (hours: number) => Record<string, HistoryPoint[]>;
}

export const useAQIStore = create<AQIState & AQIActions>((set, get) => ({
  currentValue: null,
  history: {},
  metadata: [],
  itemNames: new Set(),
  stateOptions: {},
  loading: false,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const items = await fetchItemsMetadata();
      const aqiItems = filterItemsBySemanticProperty(
        items,
        PROPERTY_AIR_QUALITY
      );
      set({
        metadata: aqiItems,
        itemNames: new Set(aqiItems.map((i) => i.name)),
      });

      // Extract state options from metadata
      const options: Record<string, string> = {};
      aqiItems.forEach((item) => {
        if (item.stateDescription?.options) {
          item.stateDescription.options.forEach((option) => {
            options[option.value] = option.label;
          });
        }
      });
      set({ stateOptions: options });

      aqiItems.forEach((item) => {
        const value = parseFloat(item.state);
        if (!isNaN(value)) {
          get().updateValue(item.name, value);
        }
      });

      // Fetch historical data for the last 2 hours
      const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
      for (const item of aqiItems) {
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
          // Add historical points
          historyPoints.forEach((point) =>
            get().updateValue(item.name, point.value, point.timestamp)
          );
        } catch (error) {
          console.error(`Failed to fetch history for ${item.name}:`, error);
        }
      }
    } catch (error) {
      set({ error: "Failed to initialize AQI data" });
      console.error("AQI store initialization error:", error);
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

  getLabelForValue: (value) => {
    const state = get();
    const valueStr = value.toString();
    return state.stateOptions[valueStr] || valueStr;
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
  await useAQIStore.getState().initialize();
  registerWebSocketListener((itemName, value) =>
    useAQIStore.getState().handleWebSocketMessage(itemName, value)
  );
})();
