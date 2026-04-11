import { FaFan } from "react-icons/fa";
import { MdAir, MdAutoMode, MdModeFanOff, MdSpeed } from "react-icons/md";
import {
  HELIOS_MANUAL_LEVEL_LABELS,
  type HeliosManualLevel,
} from "../../../../types/ventilation";
import SceneOverlayShell from "../../SceneOverlayShell";
import type { VentilationControlDefinition } from "../controlDefinitions";
import { useVentilationControlModel } from "./model";

interface VentilationHudControlProps {
  definition: VentilationControlDefinition;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface VentilationOverlayControlProps {
  definition: VentilationControlDefinition;
  onClose: () => void;
}

const TEXT_SHADOW_CLASS = "[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]";

export const VentilationHudControl = ({
  definition,
  interactive = true,
  onOpenControl,
}: VentilationHudControlProps) => {
  const { badge } = useVentilationControlModel();

  return (
    <button
      type="button"
      data-testid="hud-metric-ventilation"
      onClick={() => {
        if (!interactive) {
          return;
        }
        onOpenControl(definition.controlId);
      }}
      className="pointer-events-auto relative rounded-full p-1 text-white/95 transition hover:text-white"
      aria-label="Lüftung öffnen"
    >
      <FaFan className="h-16 w-16 md:h-20 md:w-20" />
      <span
        className={`absolute bottom-1 right-0 rounded-full border border-white/30 bg-slate-900/80 px-1.5 py-0.5 text-xs font-bold text-white md:text-sm ${TEXT_SHADOW_CLASS}`}
      >
        {badge}
      </span>
    </button>
  );
};

const getFanIcon = (level: HeliosManualLevel) => {
  const iconClassName = "h-16 w-16 md:h-24 md:w-24";
  const stageBadgeClassName =
    "absolute -bottom-2 -right-2 text-xl font-black leading-none text-white md:text-2xl";

  switch (level) {
    case -1:
      return <MdAutoMode className={iconClassName} />;
    case 0:
      return (
        <div className="relative">
          <MdModeFanOff className={iconClassName} />
          <span className={stageBadgeClassName}>0</span>
        </div>
      );
    case 1:
    case 2:
    case 3:
      return (
        <div className="relative">
          <MdAir className={iconClassName} />
          <span className={stageBadgeClassName}>{level}</span>
        </div>
      );
    case 4:
      return (
        <div className="relative">
          <MdSpeed className={iconClassName} />
          <span className={stageBadgeClassName}>4</span>
        </div>
      );
  }
};

export const VentilationOverlayControl = ({
  definition,
  onClose,
}: VentilationOverlayControlProps) => {
  const { manualLevel, actualLevel, sending, setManualLevel } =
    useVentilationControlModel();
  const toggleButtons: HeliosManualLevel[] = [-1, 0, 1, 2, 3, 4];

  return (
    <SceneOverlayShell onClose={onClose} layout="fullscreen">
      <div
        className="pointer-events-none flex h-full w-full items-center justify-center px-4 md:px-8"
        data-testid="ventilation-overlay"
      >
        <div className="pointer-events-none w-full max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                {definition.label}
              </p>
              <p
                data-testid="ventilation-overlay-status"
                className="text-4xl font-bold [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] md:text-6xl"
              >
                {actualLevel === null ? "--" : HELIOS_MANUAL_LEVEL_LABELS[actualLevel]}
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-6 gap-2 md:gap-5">
            {toggleButtons.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  void setManualLevel(level);
                }}
                disabled={sending}
                className={`
                  pointer-events-auto
                  relative aspect-square w-full rounded-2xl p-2 font-bold text-white transition-all duration-200
                  border shadow-xl backdrop-blur-md backdrop-saturate-150 md:rounded-3xl md:p-3
                  ${
                    actualLevel === level
                      ? "scale-105 border-white/80 bg-white/60 shadow-2xl shadow-white/40"
                      : manualLevel === level
                      ? manualLevel === -1
                        ? "scale-105 border-green-400/50 bg-green-500/30 shadow-2xl shadow-green-400/25"
                        : "scale-105 border-white/60 bg-white/40 shadow-2xl shadow-white/30"
                      : "border-white/20 bg-white/8 shadow-lg hover:bg-white/15"
                  }
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
                aria-label={`${definition.label} auf ${HELIOS_MANUAL_LEVEL_LABELS[level]} setzen`}
              >
                <div className="flex items-center justify-center">
                  {sending ? (
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/60 border-t-white md:h-12 md:w-12" />
                  ) : (
                    <div
                      className={`${
                        actualLevel === level || manualLevel === level
                          ? "text-white"
                          : "text-white/80"
                      }`}
                    >
                      {getFanIcon(level)}
                    </div>
                  )}
                </div>
                {manualLevel === level || actualLevel === level ? (
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t ${
                      manualLevel === level && manualLevel === -1
                        ? "from-green-500/30 to-transparent"
                        : "from-white/20 to-transparent"
                    } shadow-inner`}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SceneOverlayShell>
  );
};
