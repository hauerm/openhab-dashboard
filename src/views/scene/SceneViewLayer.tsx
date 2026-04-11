import { useSceneStoreCore } from "../../stores/sceneStoreCore";
import { SCENE_VIEW_MODULES } from "./registry";

interface SceneViewLayerProps {
  activeControlId: string | null;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
}

const SceneViewLayer = ({
  activeControlId,
  onOpenControl,
  onCloseControl,
}: SceneViewLayerProps) => {
  const currentView = useSceneStoreCore((state) => state.currentView);
  const ViewComponent = SCENE_VIEW_MODULES[currentView].Component;

  return (
    <ViewComponent
      activeControlId={activeControlId}
      onOpenControl={onOpenControl}
      onCloseControl={onCloseControl}
    />
  );
};

export default SceneViewLayer;
