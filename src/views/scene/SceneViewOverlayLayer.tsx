import type { ActiveSceneOverlay } from "../../types/overlay";
import { SCENE_VIEW_MODULES } from "./registry";

interface SceneViewOverlayLayerProps {
  activeOverlay: ActiveSceneOverlay | null;
  onClose: () => void;
}

const SceneViewOverlayLayer = ({
  activeOverlay,
  onClose,
}: SceneViewOverlayLayerProps) => {
  if (!activeOverlay) {
    return null;
  }

  const ViewOverlay = SCENE_VIEW_MODULES[activeOverlay.viewId].OverlayComponent;

  return <ViewOverlay overlayId={activeOverlay.overlayId} onClose={onClose} />;
};

export default SceneViewOverlayLayer;

