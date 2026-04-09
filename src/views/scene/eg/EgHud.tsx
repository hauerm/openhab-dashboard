import { FaFan } from "react-icons/fa";
import {
  MdCo2,
  MdHealthAndSafety,
  MdThermostat,
  MdWaterDrop,
} from "react-icons/md";
import type { SceneViewHudProps } from "../types";
import { useEgViewStore } from "./useEgViewStore";
import type { EgOverlayId } from "./EgOverlay";

const iconByMetric = {
  temp: MdThermostat,
  humidity: MdWaterDrop,
  co2: MdCo2,
  health: MdHealthAndSafety,
} as const;

const overlayByMetric: Record<keyof typeof iconByMetric, EgOverlayId> = {
  temp: "semantic:temp",
  humidity: "semantic:humidity",
  co2: "semantic:co2",
  health: "semantic:health",
};

const EgHud = ({ onOpenOverlay }: SceneViewHudProps) => {
  const { metrics, ventilationBadge } = useEgViewStore();
  const textShadowClass = "[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="absolute left-[6%] top-[8%] flex w-[88%] items-start justify-between gap-4">
        <div className="pointer-events-auto grid grid-cols-1 gap-3 sm:grid-cols-2">
          {metrics.map((metric) => {
            const Icon = iconByMetric[metric.id];
            const overlayId = overlayByMetric[metric.id];

            return (
              <button
                key={metric.id}
                type="button"
                data-testid={`hud-metric-${metric.id}`}
                onClick={() => onOpenOverlay(overlayId)}
                className="group flex items-center gap-3 rounded-xl px-1 py-1 text-left"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${metric.tint.container} ${metric.tint.icon}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-white">
                  <span
                    className={`block font-semibold leading-none ${
                      metric.id === "health" ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
                    } ${textShadowClass}`}
                  >
                    {metric.value}
                  </span>
                  <span className={`block text-sm text-white/80 ${textShadowClass}`}>
                    {metric.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          data-testid="hud-metric-ventilation"
          onClick={() => onOpenOverlay("ventilation")}
          className="pointer-events-auto relative ml-4 rounded-full p-1 text-white/95 transition hover:text-white"
          aria-label="Lüftung öffnen"
        >
          <FaFan className="h-16 w-16 md:h-20 md:w-20" />
          <span
            className={`absolute bottom-1 right-0 rounded-full border border-white/30 bg-slate-900/80 px-1.5 py-0.5 text-xs font-bold text-white md:text-sm ${textShadowClass}`}
          >
            {ventilationBadge}
          </span>
        </button>
      </div>
    </div>
  );
};

export default EgHud;

