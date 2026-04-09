import { useSceneStoreCore } from "../../stores/sceneStoreCore";
import { SCENE_VIEW_MODULES } from "./registry";
import type { SceneViewOverlayId } from "./types";

interface SceneViewHudLayerProps {
  onOpenOverlay: (overlayId: SceneViewOverlayId) => void;
}

const SceneViewHudLayer = ({ onOpenOverlay }: SceneViewHudLayerProps) => {
  const currentView = useSceneStoreCore((state) => state.currentView);
  const ViewHud = SCENE_VIEW_MODULES[currentView].HudComponent;

  return <ViewHud onOpenOverlay={onOpenOverlay} />;
};

export default SceneViewHudLayer;

