import type { ViewMetricControlDefinition } from "../controlDefinitions";
import { useViewMetricControlValue } from "./model";

interface ViewMetricHudControlProps {
  definition: ViewMetricControlDefinition;
}

export const ViewMetricHudControl = ({
  definition,
}: ViewMetricHudControlProps) => {
  const value = useViewMetricControlValue(definition);

  return (
    <div className="pointer-events-auto rounded-xl border border-ui-border-subtle bg-ui-surface-panel px-3 py-2 text-left text-ui-foreground shadow-xl backdrop-blur-md">
      <span className="block text-xs font-medium uppercase tracking-wide text-ui-foreground-muted">
        {definition.label}
      </span>
      <span className="block text-sm font-semibold leading-tight">{value}</span>
    </div>
  );
};
