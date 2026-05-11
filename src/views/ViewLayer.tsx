import { useViewStore } from "../stores/viewStore";
import LocationView from "./location/LocationView";
import OverviewView from "./overview/OverviewView";

interface ViewLayerProps {
  viewMode: "overview" | "location";
  activeControlId: string | null;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
  onSwitchToLocationView: () => void;
  allowLocationViewSwitch?: boolean;
  blockedLeftPx?: number;
}

const ViewLayer = ({
  viewMode,
  activeControlId,
  onOpenControl,
  onCloseControl,
  onSwitchToLocationView,
  allowLocationViewSwitch = true,
  blockedLeftPx = 0,
}: ViewLayerProps) => {
  const currentView = useViewStore((state) => state.currentView);

  if (viewMode === "overview") {
    return (
      <OverviewView
        viewId={currentView}
        activeControlId={activeControlId}
        onOpenControl={onOpenControl}
        onCloseControl={onCloseControl}
        onSwitchToLocationView={onSwitchToLocationView}
        allowLocationViewSwitch={allowLocationViewSwitch}
      />
    );
  }

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
