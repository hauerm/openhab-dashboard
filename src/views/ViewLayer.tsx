import { useViewStore } from "../stores/viewStore";
import LocationView from "./location/LocationView";

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

  return (
    <LocationView
      viewId={currentView}
      activeControlId={activeControlId}
      onOpenControl={onOpenControl}
      onCloseControl={onCloseControl}
      blockedLeftPx={blockedLeftPx}
    />
  );
};

export default ViewLayer;
