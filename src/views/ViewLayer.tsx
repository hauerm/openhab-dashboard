import { useViewStore } from "../stores/viewStore";
import { VIEW_MODULES } from "./registry";

interface ViewLayerProps {
  activeControlId: string | null;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
  blockedLeftPx?: number;
}

const ViewLayer = ({
  activeControlId,
  onOpenControl,
  onCloseControl,
  blockedLeftPx = 0,
}: ViewLayerProps) => {
  const currentView = useViewStore((state) => state.currentView);
  const ViewComponent = VIEW_MODULES[currentView].Component;

  return (
    <ViewComponent
      activeControlId={activeControlId}
      onOpenControl={onOpenControl}
      onCloseControl={onCloseControl}
      blockedLeftPx={blockedLeftPx}
    />
  );
};

export default ViewLayer;
