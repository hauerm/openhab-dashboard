import { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  initializeWebSocket,
  disconnectWebSocket,
} from "./services/websocket-service";
import ViewBackground from "./components/ViewBackground";
import BottomDock from "./components/BottomDock";
import { useViewStore } from "./stores/viewStore";
import type { ActiveViewOverlay } from "./types/overlay";
import ViewSidebar, { VIEW_SIDEBAR_SAFE_ZONE_PX } from "./views/ViewSidebar";
import ViewLayer from "./views/ViewLayer";

function App() {
  const [activeOverlay, setActiveOverlay] = useState<ActiveViewOverlay | null>(null);
  const initializeViewStore = useViewStore((state) => state.initialize);
  const currentView = useViewStore((state) => state.currentView);
  const loading = useViewStore((state) => state.loading);
  const error = useViewStore((state) => state.error);
  const currentViewConfig = useViewStore(
    (state) => state.viewConfigs[currentView]
  );

  useEffect(() => {
    void initializeWebSocket();
    void initializeViewStore();
    return () => {
      disconnectWebSocket();
    };
  }, [initializeViewStore]);

  const visibleOverlay = useMemo(() => {
    if (!activeOverlay) {
      return null;
    }
    return activeOverlay.viewId === currentView ? activeOverlay : null;
  }, [activeOverlay, currentView]);

  const hasSidebar = Boolean(currentViewConfig?.location);
  const blockedLeftPx = hasSidebar ? VIEW_SIDEBAR_SAFE_ZONE_PX : 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ui-surface-shell text-ui-foreground">
      <ViewBackground />
      {loading ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg border border-ui-border-subtle bg-ui-surface-overlay px-3 py-2 text-sm font-semibold text-ui-foreground shadow-xl backdrop-blur">
          Lade openHAB-Daten...
        </div>
      ) : null}
      {error ? (
        <div
          data-testid="view-store-error"
          className="fixed left-1/2 top-4 z-50 max-w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-ui-warning-border bg-ui-warning-solid px-3 py-2 text-sm font-semibold text-ui-warning-foreground shadow-xl"
        >
          {error}
        </div>
      ) : null}
      {hasSidebar ? (
        <ViewSidebar
          viewId={currentView}
          activeControlId={visibleOverlay?.controlId ?? null}
          onOpenControl={(controlId) => {
            setActiveOverlay({ viewId: currentView, controlId });
          }}
          onCloseControl={() => setActiveOverlay(null)}
        />
      ) : null}
      <ViewLayer
        activeControlId={visibleOverlay?.controlId ?? null}
        blockedLeftPx={blockedLeftPx}
        onOpenControl={(controlId) => {
          setActiveOverlay({ viewId: currentView, controlId });
        }}
        onCloseControl={() => setActiveOverlay(null)}
      />
      <BottomDock
        onViewChange={() => {
          setActiveOverlay(null);
        }}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

export default App;
