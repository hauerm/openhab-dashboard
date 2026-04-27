import { create } from "zustand";
import { fetchItemsMetadata } from "../services/openhab-service";
import { subscribeWebSocketListener } from "../services/websocket-service";
import { log } from "../services/logger";
import { buildOpenHABSemanticModel } from "../domain/openhab-model";
import type { ViewId, ViewState, ViewTrackedItemState } from "../types/view";
import { applyViewItemStateUpdate } from "./viewStore.utils";

const logger = log.createLogger("ViewStore");

const DEFAULT_VIEW_ID = "Hauer";

const buildDefaultViewConfigs = (): Record<ViewId, { label: string; baseImage: string; location: string; locationScope: "descendants" }> => ({
  [DEFAULT_VIEW_ID]: {
    label: DEFAULT_VIEW_ID,
    baseImage: "/views/missing.jpg",
    location: DEFAULT_VIEW_ID,
    locationScope: "descendants",
  },
});

const buildDefaultMissingAssets = (): Record<ViewId, boolean> => ({
  [DEFAULT_VIEW_ID]: false,
});

const buildDefaultViewLabels = (): Record<ViewId, string> => ({
  [DEFAULT_VIEW_ID]: DEFAULT_VIEW_ID,
});

let trackedItemNames = new Set<string>();
let nextOptimisticUpdateId = 1;

type ViewConfigRecord = ViewState["viewConfigs"];
export interface OptimisticItemStateSnapshot {
  itemName: string;
  optimisticUpdateId: number;
  previousState: ViewTrackedItemState | undefined;
}

interface ViewActions {
  initialize: () => Promise<void>;
  setCurrentView: (viewId: ViewId) => void;
  handleItemStateUpdate: (itemName: string, rawState: string) => void;
  setOptimisticItemState: (
    itemName: string,
    rawState: string
  ) => OptimisticItemStateSnapshot;
  rollbackOptimisticItemState: (snapshot: OptimisticItemStateSnapshot) => void;
  setMissingAsset: (viewId: ViewId, missing: boolean) => void;
}

type ViewStoreState = ViewState & ViewActions;

let initializePromise: Promise<void> | null = null;
let hasInitialized = false;
let unsubscribeWebSocket: (() => void) | null = null;

const initialState: ViewState = {
  currentView: DEFAULT_VIEW_ID,
  viewIds: [DEFAULT_VIEW_ID],
  viewConfigs: buildDefaultViewConfigs(),
  viewLabels: buildDefaultViewLabels(),
  itemStates: {},
  missingAssetByView: buildDefaultMissingAssets(),
  model: null,
  loading: false,
  error: null,
};

export const useViewStore = create<ViewStoreState>((set, get) => ({
  ...initialState,

  initialize: async () => {
    if (hasInitialized) {
      return;
    }
    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      set({ loading: true, error: null });
      try {
        const items = await fetchItemsMetadata();
        const model = buildOpenHABSemanticModel(items);
        const viewIds = model.locations.map((location) => location.name);
        const nextViewConfigs: ViewConfigRecord = {};
        const nextViewLabels: Record<ViewId, string> = {};
        const nextMissingAssets: Record<ViewId, boolean> = {};

        for (const location of model.locations) {
          nextViewConfigs[location.name] = {
            label: location.label,
            baseImage: location.baseImage,
            location: location.name,
            locationScope: "descendants",
          };
          nextViewLabels[location.name] = location.label;
          nextMissingAssets[location.name] = false;
        }

        trackedItemNames = new Set(model.trackedItemNames);
        const rawStatesByName = new Map(items.map((item) => [item.name, item.state]));

        const nextItemStates: Record<string, ViewTrackedItemState> = {
          ...get().itemStates,
        };

        for (const itemName of trackedItemNames) {
          const rawState = rawStatesByName.get(itemName) ?? "UNDEF";
          nextItemStates[itemName] = applyViewItemStateUpdate(
            nextItemStates[itemName],
            rawState
          );
        }

        set({
          currentView: viewIds.includes(get().currentView)
            ? get().currentView
            : viewIds[0] ?? DEFAULT_VIEW_ID,
          viewIds: viewIds.length > 0 ? viewIds : [DEFAULT_VIEW_ID],
          viewConfigs:
            viewIds.length > 0 ? nextViewConfigs : buildDefaultViewConfigs(),
          viewLabels:
            viewIds.length > 0 ? nextViewLabels : buildDefaultViewLabels(),
          missingAssetByView:
            viewIds.length > 0 ? nextMissingAssets : buildDefaultMissingAssets(),
          model,
          itemStates: nextItemStates,
        });

        if (model.unsupportedEquipment.length > 0) {
          logger.debug("Unsupported openHAB equipments skipped:", model.unsupportedEquipment);
        }

        if (!unsubscribeWebSocket) {
          unsubscribeWebSocket = subscribeWebSocketListener(
            (update) => get().handleItemStateUpdate(update.itemName, update.rawState),
            { itemNames: trackedItemNames }
          );
        }

        hasInitialized = true;
        logger.info("View store initialization completed");
      } catch (error) {
        logger.error("View store initialization failed:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize view data",
        });
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

  setCurrentView: (viewId) => set({ currentView: viewId }),

  handleItemStateUpdate: (itemName, rawState) => {
    if (!trackedItemNames.has(itemName) && !get().itemStates[itemName]) {
      return;
    }

    set((state) => {
      const nextItemStates = {
        ...state.itemStates,
        [itemName]: applyViewItemStateUpdate(state.itemStates[itemName], rawState),
      };

      return {
        itemStates: nextItemStates,
      };
    });
  },

  setOptimisticItemState: (itemName, rawState) => {
    const optimisticUpdateId = nextOptimisticUpdateId++;
    const previousState = get().itemStates[itemName];

    set((state) => ({
      itemStates: {
        ...state.itemStates,
        [itemName]: applyViewItemStateUpdate(previousState, rawState, {
          optimisticUpdateId,
        }),
      },
    }));

    return {
      itemName,
      optimisticUpdateId,
      previousState,
    };
  },

  rollbackOptimisticItemState: (snapshot) => {
    set((state) => {
      const currentState = state.itemStates[snapshot.itemName];
      if (
        !currentState ||
        currentState.optimisticUpdateId !== snapshot.optimisticUpdateId
      ) {
        return state;
      }

      const nextItemStates = { ...state.itemStates };
      if (snapshot.previousState) {
        nextItemStates[snapshot.itemName] = snapshot.previousState;
      } else {
        delete nextItemStates[snapshot.itemName];
      }

      return { itemStates: nextItemStates };
    });
  },

  setMissingAsset: (viewId, missing) =>
    set((state) => {
      if (state.missingAssetByView[viewId] === missing) {
        return state;
      }
      return {
        missingAssetByView: {
          ...state.missingAssetByView,
          [viewId]: missing,
        },
      };
    }),
}));

export const resetViewStore = (): void => {
  if (unsubscribeWebSocket) {
    unsubscribeWebSocket();
    unsubscribeWebSocket = null;
  }
  initializePromise = null;
  hasInitialized = false;
  trackedItemNames = new Set<string>();
  nextOptimisticUpdateId = 1;
  useViewStore.setState({
    ...initialState,
    viewLabels: buildDefaultViewLabels(),
    viewConfigs: buildDefaultViewConfigs(),
    viewIds: [DEFAULT_VIEW_ID],
    missingAssetByView: buildDefaultMissingAssets(),
  });
};

export const resetViewStoreForTests = resetViewStore;
