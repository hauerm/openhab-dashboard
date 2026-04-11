import { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  initializeWebSocket,
  disconnectWebSocket,
} from "./services/websocket-service";
import SceneBackground from "./components/SceneBackground";
import BottomDock from "./components/BottomDock";
import { useSceneStoreCore } from "./stores/sceneStoreCore";
import type { ActiveSceneOverlay } from "./types/overlay";
import SceneViewLayer from "./views/scene/SceneViewLayer";

function App() {
  const [activeOverlay, setActiveOverlay] = useState<ActiveSceneOverlay | null>(null);
  const initializeSceneStoreCore = useSceneStoreCore((state) => state.initialize);
  const currentView = useSceneStoreCore((state) => state.currentView);

  useEffect(() => {
    void initializeWebSocket();
    void initializeSceneStoreCore();
    return () => {
      disconnectWebSocket();
    };
  }, [initializeSceneStoreCore]);

  const visibleOverlay = useMemo(() => {
    if (!activeOverlay) {
      return null;
    }
    return activeOverlay.viewId === currentView ? activeOverlay : null;
  }, [activeOverlay, currentView]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <SceneBackground />
      <SceneViewLayer
        activeControlId={visibleOverlay?.controlId ?? null}
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
