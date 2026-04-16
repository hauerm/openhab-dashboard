import type { ViewProps } from "../types";

const House = ({
  activeControlId,
  onOpenControl,
  onCloseControl,
}: ViewProps) => {
  void activeControlId;
  void onOpenControl;
  void onCloseControl;

  return <div className="pointer-events-none absolute inset-0 z-20" />;
};

export default House;
