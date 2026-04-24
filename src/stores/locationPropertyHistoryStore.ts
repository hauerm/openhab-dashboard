import { create } from "zustand";
import type { Item } from "../types/item";
import type {
  LocationPropertyControlConfig,
} from "../views/controls/location-property-history/config";
import {
  getHistoryRangeDurationMs,
  type HistoryRangeKey,
} from "../views/controls/location-property-history/config";
import {
  fetchItemsMetadata,
  getItemHistory,
  filterItems,
} from "../services/openhab-service";
import { log } from "../services/logger";
import { parseOpenHABState } from "../services/state-parser";
import type { ParsedStateKind } from "../services/state-parser";
import type { WebSocketItemUpdate } from "../services/websocket-service";
import { subscribeWebSocketListener } from "../services/websocket-service";
import type {
  LocationPropertyMeasurementRole,
  LocationScope,
} from "../types/view";

interface HistoryPoint {
  timestamp: number;
  value: number;
}

type LocationPropertyCurrentStatus = "ready" | "unavailable";

interface LocationPropertyState {
  currentValue: number | null;
  currentValueStatus: LocationPropertyCurrentStatus;
  history: Record<string, HistoryPoint[]>;
  metadata: Item[];
  itemNames: Set<string>;
  latestValues: Record<string, number | null>;
  latestRawStates: Record<string, string>;
  latestStateKinds: Record<string, ParsedStateKind>;
  loading: boolean;
  error: string | null;
}

interface LocationPropertyActions {
  initialize: (
    location?: string,
    locationScope?: LocationScope,
    measurementRole?: LocationPropertyMeasurementRole
  ) => Promise<void>;
  ensureHistoryRange: (rangeKey: HistoryRangeKey) => Promise<void>;
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

const HISTORY_FETCH_CONCURRENCY = 5;

const buildStoreKey = (config: LocationPropertyControlConfig, scopeKey: string): string =>
  `${config.property}::${scopeKey}`;

const isLocationPropertyHistoryDebugEnabled = (): boolean => {
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
  const normalizeEpoch = (epoch: number): number =>
    epoch < 1_000_000_000_000 ? epoch * 1000 : epoch;

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

const mergeHistoryPoints = (
  existing: HistoryPoint[],
  incoming: HistoryPoint[],
  cutoffTimestamp: number
): HistoryPoint[] => {
  const merged = new Map<number, number>();

  for (const point of existing) {
    if (point.timestamp >= cutoffTimestamp) {
      merged.set(point.timestamp, point.value);
    }
  }

  for (const point of incoming) {
    if (point.timestamp >= cutoffTimestamp) {
      merged.set(point.timestamp, point.value);
    }
  }

  return Array.from(merged.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, value]) => ({ timestamp, value }));
};

const runWithConcurrency = async <T>(
  items: T[],
  maxConcurrency: number,
  worker: (item: T) => Promise<void>
) => {
  if (items.length === 0) {
    return;
  }

  let index = 0;
  const runnerCount = Math.min(maxConcurrency, items.length);

  await Promise.all(
    Array.from({ length: runnerCount }, async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        await worker(items[currentIndex]);
      }
    })
  );
};

const createStoreForConfig = (config: LocationPropertyControlConfig) => {
  const logger = log.createLogger(config.title);
  const debugLocationPropertyHistory = isLocationPropertyHistoryDebugEnabled();
  const maxRetentionDurationMs = getHistoryRangeDurationMs(
    config.maxHistoryRangeKey ?? "year"
  );

  let initializePromise: Promise<void> | null = null;
  let historyFetchPromise: Promise<void> | null = null;
  let inFlightStartTimestamp: number | null = null;
  let loadedSinceTimestamp: number | null = null;
  let initializedLocationKey: string | null = null;
  let unsubscribeWebSocket: (() => void) | null = null;

  return create<LocationPropertyState & LocationPropertyActions>((set, get) => ({
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

    initialize: async (
      location?: string,
      locationScope: LocationScope = "descendants",
      measurementRole?: LocationPropertyMeasurementRole
    ) => {
      const locationKey = location?.trim() || "__all__";
      const measurementRoleKey = measurementRole ?? "__all__";
      const locationScopeKey = `${locationKey}::${locationScope}::${measurementRoleKey}`;

      if (initializedLocationKey === locationScopeKey) {
        return;
      }

      if (initializePromise) {
        return initializePromise;
      }

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

          loadedSinceTimestamp = null;
          inFlightStartTimestamp = null;
          historyFetchPromise = null;

          const items = await fetchItemsMetadata();
          const filteredItems = filterItems(items, {
            property: config.property,
            location,
            locationScope,
            measurementRole,
          });

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

          if (!unsubscribeWebSocket) {
            unsubscribeWebSocket = subscribeWebSocketListener((update) =>
              get().handleWebSocketMessage(update)
            );
          }

          initializedLocationKey = locationScopeKey;

          if (debugLocationPropertyHistory) {
            logger.debug(
              `[Debug] Initialized ${config.property} for ${locationScopeKey} with ${filteredItems.length} items`
            );
          }
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

    ensureHistoryRange: async (rangeKey) => {
      const itemNames = Array.from(get().itemNames);
      if (itemNames.length === 0) {
        return;
      }

      const requestedStart = Date.now() - getHistoryRangeDurationMs(rangeKey);

      if (
        loadedSinceTimestamp !== null &&
        loadedSinceTimestamp <= requestedStart
      ) {
        return;
      }

      while (historyFetchPromise) {
        const inFlightCoversRequested =
          inFlightStartTimestamp !== null &&
          inFlightStartTimestamp <= requestedStart;

        await historyFetchPromise;

        if (
          inFlightCoversRequested ||
          (loadedSinceTimestamp !== null && loadedSinceTimestamp <= requestedStart)
        ) {
          return;
        }
      }

      const fetchStart =
        loadedSinceTimestamp !== null
          ? Math.min(loadedSinceTimestamp, requestedStart)
          : requestedStart;

      inFlightStartTimestamp = fetchStart;
      historyFetchPromise = (async () => {
        const retentionCutoff = Date.now() - maxRetentionDurationMs;
        const nextHistory: Record<string, HistoryPoint[]> = { ...get().history };
        const nextValues: Record<string, number | null> = { ...get().latestValues };
        const nextRawStates: Record<string, string> = { ...get().latestRawStates };
        const nextKinds: Record<string, ParsedStateKind> = {
          ...get().latestStateKinds,
        };

        set({ loading: true, error: null });

        await runWithConcurrency(
          itemNames,
          HISTORY_FETCH_CONCURRENCY,
          async (itemName) => {
            try {
              const historyResponse = await getItemHistory(itemName, {
                starttime: new Date(fetchStart).toISOString(),
              });

              const incomingPoints = historyResponse.data
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
                    point !== null && point.timestamp >= retentionCutoff
                )
                .sort((a, b) => a.timestamp - b.timestamp);

              const mergedPoints = mergeHistoryPoints(
                nextHistory[itemName] ?? [],
                incomingPoints,
                retentionCutoff
              );

              nextHistory[itemName] = mergedPoints;

              const latestPoint = mergedPoints[mergedPoints.length - 1];
              if (latestPoint) {
                nextValues[itemName] = latestPoint.value;
                nextRawStates[itemName] = String(latestPoint.value);
                nextKinds[itemName] = "numeric";
              }
            } catch (error) {
              logger.error(`Failed to fetch history for ${itemName}:`, error);
            }
          }
        );

        const currentValue = computeAverage(nextValues);
        set({
          history: nextHistory,
          latestValues: nextValues,
          latestRawStates: nextRawStates,
          latestStateKinds: nextKinds,
          currentValue,
          currentValueStatus: currentValue === null ? "unavailable" : "ready",
        });

        loadedSinceTimestamp =
          loadedSinceTimestamp === null
            ? fetchStart
            : Math.min(loadedSinceTimestamp, fetchStart);
      })();

      try {
        await historyFetchPromise;
      } finally {
        historyFetchPromise = null;
        inFlightStartTimestamp = null;
        set({ loading: false });
      }
    },

    updateValue: (itemName, value, timestamp, rawState) => {
      const now = timestamp ?? Date.now();
      const retentionCutoff = now - maxRetentionDurationMs;

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

        const existingHistory = nextHistory[itemName] ?? [];
        nextHistory[itemName] = mergeHistoryPoints(
          existingHistory,
          [{ timestamp: now, value }],
          retentionCutoff
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

const locationPropertyHistoryStoreRegistry = new Map<
  string,
  ReturnType<typeof createStoreForConfig>
>();

export const createLocationPropertyHistoryStore = (
  config: LocationPropertyControlConfig,
  scopeKey = "global"
) => {
  const key = buildStoreKey(config, scopeKey);
  const existingStore = locationPropertyHistoryStoreRegistry.get(key);
  if (existingStore) {
    return existingStore;
  }

  const store = createStoreForConfig(config);
  locationPropertyHistoryStoreRegistry.set(key, store);
  return store;
};
