import { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  initializeWebSocket,
  disconnectWebSocket,
} from "./services/websocket-service";
import ViewBackground from "./components/ViewBackground";
import BottomDock from "./components/BottomDock";
import { VIEWS } from "./config/views";
import { useViewStore } from "./stores/viewStore";
import type { ActiveViewOverlay } from "./types/overlay";
import ViewSidebar, { VIEW_SIDEBAR_SAFE_ZONE_PX } from "./views/ViewSidebar";
import ViewLayer from "./views/ViewLayer";

function App() {
  const [activeOverlay, setActiveOverlay] = useState<ActiveViewOverlay | null>(null);
  const initializeViewStore = useViewStore((state) => state.initialize);
  const currentView = useViewStore((state) => state.currentView);

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

  const hasSidebar = Boolean(VIEWS[currentView].location);
  const blockedLeftPx = hasSidebar ? VIEW_SIDEBAR_SAFE_ZONE_PX : 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ui-surface-shell text-ui-foreground">
      <ViewBackground />
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
