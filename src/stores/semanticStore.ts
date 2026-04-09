import { create } from "zustand";
import type { Item } from "../types/item";
import {
  fetchItemsMetadata,
  getItemHistory,
  filterItems,
} from "../services/openhab-service";
import { log } from "../services/logger";
import type { SemanticTypeConfig } from "../config/semanticTypes";
import { parseOpenHABState } from "../services/state-parser";
import type { ParsedStateKind } from "../services/state-parser";
import type { WebSocketItemUpdate } from "../services/websocket-service";
import { subscribeWebSocketListener } from "../services/websocket-service";

interface HistoryPoint {
  timestamp: number;
  value: number;
}

type SemanticCurrentStatus = "ready" | "unavailable";

interface SemanticState {
  currentValue: number | null;
  currentValueStatus: SemanticCurrentStatus;
  history: Record<string, HistoryPoint[]>; // itemName -> history
  metadata: Item[];
  itemNames: Set<string>;
  latestValues: Record<string, number | null>;
  latestRawStates: Record<string, string>;
  latestStateKinds: Record<string, ParsedStateKind>;
  loading: boolean;
  error: string | null;
}

interface SemanticActions {
  initialize: (location?: string) => Promise<void>;
  updateValue: (
    itemName: string,
    value: number,
    timestamp?: number,
    rawState?: string
  ) => void;
  setUnavailableState: (
    itemName: string,
    rawState: string,
    kind: ParsedStateKind
  ) => void;
  handleWebSocketMessage: (update: WebSocketItemUpdate) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getAveragedValue: () => number | null;
  getRecentHistory: (hours: number) => Record<string, HistoryPoint[]>;
}

const buildStoreKey = (config: SemanticTypeConfig, scopeKey: string): string =>
  `${config.property}::${scopeKey}`;

const isSemanticDebugEnabled = (): boolean => {
  // Only enable verbose semantic logs when debug/trace is explicitly configured.
  const rawLevel = (
    import.meta.env.VITE_LOGLEVEL || import.meta.env.VITE_LOG_LEVEL || ""
  ).toLowerCase();
  const normalized = rawLevel.split("#")[0]?.trim();
  return normalized === "debug" || normalized === "trace";
};

const computeAverage = (
  latestValues: Record<string, number | null>
): number | null => {
  const numericValues = Object.values(latestValues).filter(
    (value): value is number => value !== null
  );
  if (numericValues.length === 0) {
    return null;
  }
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
};

const parseHistoryTimestamp = (value: number | string): number | null => {
  const normalizeEpoch = (epoch: number): number => {
    // Normalize seconds to milliseconds if needed.
    return epoch < 1_000_000_000_000 ? epoch * 1000 : epoch;
  };

  if (typeof value === "number" && Number.isFinite(value)) {
    return normalizeEpoch(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return normalizeEpoch(numeric);
  }

  const parsedDate = Date.parse(trimmed);
  return Number.isFinite(parsedDate) ? parsedDate : null;
};

const createStoreForConfig = (config: SemanticTypeConfig) => {
  const logger = log.createLogger(config.title);
  const debugSemanticProperty = isSemanticDebugEnabled();
  let initializePromise: Promise<void> | null = null;
  let initializedLocationKey: string | null = null;
  let unsubscribeWebSocket: (() => void) | null = null;

  return create<SemanticState & SemanticActions>((set, get) => ({
    currentValue: null,
    currentValueStatus: "unavailable",
    history: {},
    metadata: [],
    itemNames: new Set(),
    latestValues: {},
    latestRawStates: {},
    latestStateKinds: {},
    loading: false,
    error: null,

    initialize: async (location?: string) => {
      const locationKey = location?.trim() || "__all__";
      if (initializedLocationKey === locationKey && get().itemNames.size > 0) {
        return;
      }
      if (initializePromise) {
        return initializePromise;
      }

      logger.info(
        `Initializing ${config.title} store${
          location ? ` for location: ${location}` : ""
        }`
      );

      initializePromise = (async () => {
        try {
          set({
            loading: true,
            error: null,
            history: {},
            metadata: [],
            itemNames: new Set(),
            currentValue: null,
            currentValueStatus: "unavailable",
            latestValues: {},
            latestRawStates: {},
            latestStateKinds: {},
          });

          const items = await fetchItemsMetadata();
          const filteredItems = filterItems(items, {
            property: config.property,
            location,
          });

          if (debugSemanticProperty) {
            const itemSummaries = filteredItems.map((item) => ({
              name: item.name,
              type: item.type,
              state: item.state,
              relatesTo:
                typeof item.metadata?.semantics?.config === "object" &&
                item.metadata?.semantics?.config !== null &&
                "relatesTo" in item.metadata.semantics.config
                  ? String(item.metadata.semantics.config.relatesTo)
                  : undefined,
              hasLocation:
                typeof item.metadata?.semantics?.config === "object" &&
                item.metadata?.semantics?.config !== null &&
                "hasLocation" in item.metadata.semantics.config
                  ? String(item.metadata.semantics.config.hasLocation)
                  : undefined,
              isPartOf:
                typeof item.metadata?.semantics?.config === "object" &&
                item.metadata?.semantics?.config !== null &&
                "isPartOf" in item.metadata.semantics.config
                  ? String(item.metadata.semantics.config.isPartOf)
                  : undefined,
            }));

            logger.debug(
              `[Debug] ${config.property} items for location "${
                location ?? "__all__"
              }" (${itemSummaries.length}):`,
              itemSummaries
            );
          }

          const itemNames = new Set(filteredItems.map((item) => item.name));
          const latestValues: Record<string, number | null> = {};
          const latestRawStates: Record<string, string> = {};
          const latestStateKinds: Record<string, ParsedStateKind> = {};
          const history: Record<string, HistoryPoint[]> = {};

          for (const item of filteredItems) {
            const parsed = parseOpenHABState(item.state);
            latestValues[item.name] = parsed.numericValue;
            latestRawStates[item.name] = parsed.raw;
            latestStateKinds[item.name] = parsed.kind;
            history[item.name] = [];
          }

          const historyStart = new Date(
            Date.now() - (config.fallbackHours || 24) * 3600000
          ).toISOString();
          const historyRetentionHours = config.fallbackHours || config.historyHours;
          const historyRetentionCutoff =
            Date.now() - historyRetentionHours * 3600000;

          await Promise.all(
            filteredItems.map(async (item) => {
              try {
                const historyResponse = await getItemHistory(item.name, {
                  starttime: historyStart,
                });

                const points = historyResponse.data
                  .map((datapoint) => {
                    const parsed = parseOpenHABState(datapoint.state);
                    const timestamp = parseHistoryTimestamp(datapoint.time);
                    if (parsed.numericValue === null || timestamp === null) {
                      return null;
                    }
                    return {
                      timestamp,
                      value: parsed.numericValue,
                    };
                  })
                  .filter(
                    (point): point is HistoryPoint =>
                      point !== null && point.timestamp >= historyRetentionCutoff
                  )
                  .sort((a, b) => a.timestamp - b.timestamp);

                history[item.name] = points;
                const latestPoint = points[points.length - 1];
                if (latestPoint) {
                  latestValues[item.name] = latestPoint.value;
                  latestRawStates[item.name] = String(latestPoint.value);
                  latestStateKinds[item.name] = "numeric";
                }

                if (debugSemanticProperty) {
                  logger.debug(
                    `[Debug] History for ${item.name} (${points.length} points):`,
                    points.map((point) => ({
                      timestamp: point.timestamp,
                      isoTime: new Date(point.timestamp).toISOString(),
                      value: point.value,
                    }))
                  );
                }
              } catch (error) {
                logger.error(`Failed to fetch history for ${item.name}:`, error);
              }
            })
          );

          const currentValue = computeAverage(latestValues);
          set({
            metadata: filteredItems,
            itemNames,
            history,
            latestValues,
            latestRawStates,
            latestStateKinds,
            currentValue,
            currentValueStatus: currentValue === null ? "unavailable" : "ready",
          });

          if (debugSemanticProperty) {
            logger.debug(`[Debug] Aggregated latest values for ${config.property}:`, {
              currentValue,
              latestValues,
            });
          }

          if (!unsubscribeWebSocket) {
            unsubscribeWebSocket = subscribeWebSocketListener((update) =>
              get().handleWebSocketMessage(update)
            );
          }

          initializedLocationKey = locationKey;
          logger.info(`${config.title} store initialization completed`);
        } catch (error) {
          set({
            error: `Failed to initialize ${config.title.toLowerCase()} data`,
          });
          logger.error(`${config.title} store initialization error:`, error);
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

    updateValue: (itemName, value, timestamp, rawState) => {
      const now = timestamp ?? Date.now();
      set((state) => {
        const nextHistory = { ...state.history };
        const nextValues: Record<string, number | null> = {
          ...state.latestValues,
          [itemName]: value,
        };
        const nextRawStates: Record<string, string> = {
          ...state.latestRawStates,
          [itemName]: rawState ?? value.toString(),
        };
        const nextKinds: Record<string, ParsedStateKind> = {
          ...state.latestStateKinds,
          [itemName]: "numeric",
        };

        if (!nextHistory[itemName]) {
          nextHistory[itemName] = [];
        }
        nextHistory[itemName] = [
          ...nextHistory[itemName],
          { timestamp: now, value },
        ].filter(
          (point) =>
            point.timestamp >=
            now - (config.fallbackHours || config.historyHours) * 3600000
        );

        const average = computeAverage(nextValues);
        return {
          history: nextHistory,
          latestValues: nextValues,
          latestRawStates: nextRawStates,
          latestStateKinds: nextKinds,
          currentValue: average,
          currentValueStatus: average === null ? "unavailable" : "ready",
        };
      });
    },

    setUnavailableState: (itemName, rawState, kind) => {
      set((state) => {
        const nextValues = { ...state.latestValues, [itemName]: null };
        const average = computeAverage(nextValues);
        return {
          latestValues: nextValues,
          latestRawStates: { ...state.latestRawStates, [itemName]: rawState },
          latestStateKinds: { ...state.latestStateKinds, [itemName]: kind },
          currentValue: average,
          currentValueStatus: average === null ? "unavailable" : "ready",
        };
      });
    },

    handleWebSocketMessage: (update) => {
      if (!get().itemNames.has(update.itemName)) {
        return;
      }

      if (update.numericValue === null) {
        get().setUnavailableState(
          update.itemName,
          update.rawState,
          update.stateKind
        );
        return;
      }

      get().updateValue(
        update.itemName,
        update.numericValue,
        update.timestamp,
        update.rawState
      );
    },

    setLoading: (loading) => {
      set({ loading });
    },

    setError: (error) => {
      set({ error });
    },

    getAveragedValue: () => get().currentValue,

    getRecentHistory: (hours) => {
      const now = Date.now();
      const cutoff = now - hours * 3600000;
      const recent: Record<string, HistoryPoint[]> = {};

      for (const [itemName, points] of Object.entries(get().history)) {
        recent[itemName] = points.filter((point) => point.timestamp >= cutoff);
      }

      return recent;
    },
  }));
};

const semanticStoreRegistry = new Map<
  string,
  ReturnType<typeof createStoreForConfig>
>();

/**
 * Factory function returning stable semantic stores by property + scope key.
 */
export const createSemanticStore = (
  config: SemanticTypeConfig,
  scopeKey = "global"
) => {
  const key = buildStoreKey(config, scopeKey);
  const existingStore = semanticStoreRegistry.get(key);
  if (existingStore) {
    return existingStore;
  }

  const store = createStoreForConfig(config);
  semanticStoreRegistry.set(key, store);
  return store;
};
