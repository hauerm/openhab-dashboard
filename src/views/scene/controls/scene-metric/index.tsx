import type { SceneMetricControlDefinition } from "../controlDefinitions";
import { useSceneMetricControlValue } from "./model";

interface SceneMetricHudControlProps {
  definition: SceneMetricControlDefinition;
}

export const SceneMetricHudControl = ({
  definition,
}: SceneMetricHudControlProps) => {
  const value = useSceneMetricControlValue(definition);

  return (
    <div className="pointer-events-auto rounded-xl border border-white/25 bg-slate-900/35 px-3 py-2 text-left text-white/90 shadow-xl backdrop-blur-md">
      <span className="block text-xs font-medium uppercase tracking-wide text-white/70">
        {definition.label}
      </span>
      <span className="block text-sm font-semibold leading-tight">{value}</span>
    </div>
  );
};
