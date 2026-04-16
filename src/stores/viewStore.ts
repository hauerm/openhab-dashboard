import { create } from "zustand";
import { fetchItemsMetadata } from "../services/openhab-service";
import { subscribeWebSocketListener } from "../services/websocket-service";
import { log } from "../services/logger";
import { VIEW_IDS, VIEWS } from "../config/views";
import type { Item } from "../types/item";
import type { ViewId, ViewState, ViewTrackedItemState } from "../types/view";
import { VIEW_TRACKED_ITEM_NAMES_BY_VIEW } from "../views/viewDescriptors";
import { applyViewItemStateUpdate } from "./viewStore.utils";

const logger = log.createLogger("ViewStore");

const buildDefaultMissingAssets = (): Record<ViewId, boolean> => ({
  house: false,
  eg: false,
  living: false,
});

const buildDefaultViewLabels = (): Record<ViewId, string> => ({
  house: VIEWS.house.label,
  eg: VIEWS.eg.label,
  living: VIEWS.living.label,
});

const resolveViewLabelsFromItems = (items: Item[]): Record<ViewId, string> => {
  const itemsByName = new Map(items.map((item) => [item.name, item]));

  return VIEW_IDS.reduce<Record<ViewId, string>>((labels, viewId) => {
    const viewConfig = VIEWS[viewId];
    const locationLabel =
      viewConfig.location ? itemsByName.get(viewConfig.location)?.label?.trim() : null;

    labels[viewId] = locationLabel || viewConfig.label;
    return labels;
  }, buildDefaultViewLabels());
};

const collectTrackedItemNames = (): Set<string> => {
  const tracked = new Set<string>();
  for (const viewId of VIEW_IDS) {
    for (const trackedItemName of VIEW_TRACKED_ITEM_NAMES_BY_VIEW[viewId]) {
      tracked.add(trackedItemName);
    }
  }
  return tracked;
};

const VIEW_TRACKED_ITEM_NAMES = collectTrackedItemNames();

interface ViewActions {
  initialize: () => Promise<void>;
  setCurrentView: (viewId: ViewId) => void;
  handleItemStateUpdate: (itemName: string, rawState: string) => void;
  setMissingAsset: (viewId: ViewId, missing: boolean) => void;
}

type ViewStoreState = ViewState & ViewActions;

let initializePromise: Promise<void> | null = null;
let hasInitialized = false;
let unsubscribeWebSocket: (() => void) | null = null;

const initialState: ViewState = {
  currentView: "house",
  viewLabels: buildDefaultViewLabels(),
  itemStates: {},
  missingAssetByView: buildDefaultMissingAssets(),
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
        const rawStatesByName = new Map(items.map((item) => [item.name, item.state]));

        const nextItemStates: Record<string, ViewTrackedItemState> = {
          ...get().itemStates,
        };

        for (const itemName of VIEW_TRACKED_ITEM_NAMES) {
          const rawState = rawStatesByName.get(itemName) ?? "UNDEF";
          nextItemStates[itemName] = applyViewItemStateUpdate(
            nextItemStates[itemName],
            rawState
          );
        }

        set({
          itemStates: nextItemStates,
          viewLabels: resolveViewLabelsFromItems(items),
        });

        if (!unsubscribeWebSocket) {
          unsubscribeWebSocket = subscribeWebSocketListener(
            (update) => get().handleItemStateUpdate(update.itemName, update.rawState),
            { itemNames: VIEW_TRACKED_ITEM_NAMES }
          );
        }

        hasInitialized = true;
        logger.info("View store initialization completed");
      } catch (error) {
        logger.error("View store initialization failed:", error);
        set({ error: "Failed to initialize view data" });
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
    if (!VIEW_TRACKED_ITEM_NAMES.has(itemName)) {
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

export const resetViewStoreForTests = (): void => {
  if (unsubscribeWebSocket) {
    unsubscribeWebSocket();
    unsubscribeWebSocket = null;
  }
  initializePromise = null;
  hasInitialized = false;
  useViewStore.setState({
    ...initialState,
    viewLabels: buildDefaultViewLabels(),
    missingAssetByView: buildDefaultMissingAssets(),
  });
};
