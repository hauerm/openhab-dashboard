import { SCENE_VIEW_IDS, SCENE_VIEWS } from "../config/sceneViews";
import { useSceneStoreCore } from "../stores/sceneStoreCore";
import type { ViewId } from "../types/scene";

interface BottomDockProps {
  onViewChange?: (viewId: ViewId) => void;
}

const BottomDock = ({ onViewChange }: BottomDockProps) => {
  const currentView = useSceneStoreCore((state) => state.currentView);
  const setCurrentView = useSceneStoreCore((state) => state.setCurrentView);

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-slate-900/55 px-3 py-2 shadow-2xl backdrop-blur-md">
        {SCENE_VIEW_IDS.map((viewId) => {
          const isActive = currentView === viewId;
          return (
            <button
              key={viewId}
              type="button"
              data-testid={`dock-button-${viewId}`}
              onClick={() => {
                onViewChange?.(viewId);
                setCurrentView(viewId);
              }}
              className={`min-w-20 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-slate-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              aria-label={`Wechsel zu ${SCENE_VIEWS[viewId].label}`}
            >
              {SCENE_VIEWS[viewId].label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomDock;
