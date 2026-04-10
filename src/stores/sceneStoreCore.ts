import { create } from "zustand";
import { fetchItemsMetadata } from "../services/openhab-service";
import { subscribeWebSocketListener } from "../services/websocket-service";
import { log } from "../services/logger";
import { SCENE_VIEW_IDS } from "../config/sceneViews";
import type { SceneState, SceneTrackedItemState, ViewId } from "../types/scene";
import { SCENE_VIEW_TRACKED_ITEM_NAMES } from "../views/scene/viewDescriptors";
import { applySceneItemStateUpdate } from "./sceneStore.utils";

const logger = log.createLogger("SceneStoreCore");

const buildDefaultMissingAssets = (): Record<ViewId, boolean> => ({
  house: false,
  eg: false,
  living: false,
});

const collectTrackedItemNames = (): Set<string> => {
  const tracked = new Set<string>();
  for (const viewId of SCENE_VIEW_IDS) {
    for (const trackedItemName of SCENE_VIEW_TRACKED_ITEM_NAMES[viewId]) {
      tracked.add(trackedItemName);
    }
  }
  return tracked;
};

const SCENE_TRACKED_ITEM_NAMES = collectTrackedItemNames();

interface SceneCoreActions {
  initialize: () => Promise<void>;
  setCurrentView: (viewId: ViewId) => void;
  handleItemStateUpdate: (itemName: string, rawState: string) => void;
  setMissingAsset: (viewId: ViewId, missing: boolean) => void;
}

type SceneStoreCoreState = SceneState & SceneCoreActions;

let initializePromise: Promise<void> | null = null;
let hasInitialized = false;
let unsubscribeWebSocket: (() => void) | null = null;

const initialState: SceneState = {
  currentView: "house",
  itemStates: {},
  missingAssetByView: buildDefaultMissingAssets(),
  loading: false,
  error: null,
};

export const useSceneStoreCore = create<SceneStoreCoreState>((set, get) => ({
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

        const nextItemStates: Record<string, SceneTrackedItemState> = {
          ...get().itemStates,
        };

        for (const itemName of SCENE_TRACKED_ITEM_NAMES) {
          const rawState = rawStatesByName.get(itemName) ?? "UNDEF";
          nextItemStates[itemName] = applySceneItemStateUpdate(
            nextItemStates[itemName],
            rawState
          );
        }

        set({ itemStates: nextItemStates });

        if (!unsubscribeWebSocket) {
          unsubscribeWebSocket = subscribeWebSocketListener(
            (update) => get().handleItemStateUpdate(update.itemName, update.rawState),
            { itemNames: SCENE_TRACKED_ITEM_NAMES }
          );
        }

        hasInitialized = true;
        logger.info("Scene store core initialization completed");
      } catch (error) {
        logger.error("Scene store core initialization failed:", error);
        set({ error: "Failed to initialize scene data" });
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
    if (!SCENE_TRACKED_ITEM_NAMES.has(itemName)) {
      return;
    }

    set((state) => {
      const nextItemStates = {
        ...state.itemStates,
        [itemName]: applySceneItemStateUpdate(state.itemStates[itemName], rawState),
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

export const resetSceneStoreCoreForTests = (): void => {
  if (unsubscribeWebSocket) {
    unsubscribeWebSocket();
    unsubscribeWebSocket = null;
  }
  initializePromise = null;
  hasInitialized = false;
  useSceneStoreCore.setState({
    ...initialState,
    missingAssetByView: buildDefaultMissingAssets(),
  });
};
