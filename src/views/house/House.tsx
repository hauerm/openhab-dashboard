import type { ViewProps } from "../types";
import { ViewMetricHudControl } from "../controls/view-metric";
import { useHouseViewModel } from "./useHouseViewModel";

const House = ({
  activeControlId,
  onOpenControl,
  onCloseControl,
}: ViewProps) => {
  void activeControlId;
  void onOpenControl;
  void onCloseControl;

  const controls = useHouseViewModel();

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {controls.map((definition) => (
        <div
          key={definition.controlId}
          className="absolute touch-none select-none"
          style={{
            left: `${definition.defaultPosition.x}%`,
            top: `${definition.defaultPosition.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <ViewMetricHudControl definition={definition} />
        </div>
      ))}
    </div>
  );
};

export default House;
