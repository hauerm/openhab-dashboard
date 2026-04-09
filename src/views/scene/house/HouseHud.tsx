import { useHouseViewStore } from "./useHouseViewStore";
import type { SceneViewHudProps } from "../types";

const HouseHud = ({ onOpenOverlay }: SceneViewHudProps) => {
  void onOpenOverlay;
  const { metrics } = useHouseViewStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="absolute -translate-x-1/2"
          style={{ top: metric.position.top, left: metric.position.left }}
        >
          <div className="pointer-events-auto rounded-xl border border-white/25 bg-slate-900/35 px-3 py-2 text-left text-white/90 shadow-xl backdrop-blur-md">
            <span className="block text-xs font-medium uppercase tracking-wide text-white/70">
              {metric.label}
            </span>
            <span className="block text-sm font-semibold leading-tight">
              {metric.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HouseHud;
