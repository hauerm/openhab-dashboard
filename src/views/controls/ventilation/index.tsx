import { FaFan } from "react-icons/fa";
import { MdAir, MdAutoMode, MdModeFanOff, MdSpeed } from "react-icons/md";
import {
  HELIOS_MANUAL_LEVEL_LABELS,
  type HeliosManualLevel,
} from "../../../types/ventilation";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { VentilationControlDefinition } from "../controlDefinitions";
import { useVentilationControlModel } from "./model";

const TEXT_SHADOW_CLASS = "[text-shadow:0_2px_8px_var(--color-ui-shadow-text)]";
const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

interface VentilationHudControlProps {
  definition: VentilationControlDefinition;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface VentilationOverlayControlProps {
  definition: VentilationControlDefinition;
  onClose: () => void;
}

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
      className="pointer-events-auto relative rounded-full p-1 text-ui-foreground transition hover:brightness-110"
      aria-label="Lüftung öffnen"
    >
      <FaFan className="h-16 w-16 md:h-20 md:w-20" />
      <span
        className={`absolute bottom-1 right-0 rounded-full border border-ui-border-subtle bg-ui-surface-image-strong px-1.5 py-0.5 text-xs font-bold text-ui-foreground md:text-sm ${TEXT_SHADOW_CLASS}`}
      >
        {badge}
      </span>
    </button>
  );
};

const getFanIcon = (level: HeliosManualLevel) => {
  const iconClassName = "h-16 w-16 md:h-24 md:w-24";
  const stageBadgeClassName =
    "absolute -bottom-2 -right-2 text-xl font-black leading-none text-ui-foreground md:text-2xl";

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
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        className="pointer-events-none flex h-full w-full items-center justify-center px-4 md:px-8"
        data-testid="ventilation-overlay"
      >
        <div className="pointer-events-none w-full max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4 text-ui-foreground">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ui-foreground-muted">
                {definition.label}
              </p>
              <p
                data-testid="ventilation-overlay-status"
                className={`text-4xl font-bold md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
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
                  relative aspect-square w-full rounded-2xl p-2 font-bold text-ui-foreground transition-all duration-200
                  border shadow-xl backdrop-blur-md backdrop-saturate-150 md:rounded-3xl md:p-3
                  ${
                    actualLevel === level
                      ? "scale-105 border-ui-border-strong bg-ui-surface-muted shadow-2xl"
                      : manualLevel === level
                      ? manualLevel === -1
                        ? "scale-105 border-semantic-active-solid bg-status-good-surface shadow-[0_0_36px_var(--color-semantic-active-glow)]"
                        : "scale-105 border-ui-border-strong bg-ui-surface-muted shadow-2xl"
                      : "border-ui-border-subtle bg-ui-surface-overlay shadow-lg hover:bg-ui-surface-panel"
                  }
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
                aria-label={`${definition.label} auf ${HELIOS_MANUAL_LEVEL_LABELS[level]} setzen`}
              >
                <div className="flex items-center justify-center">
                  {sending ? (
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-ui-border-strong border-t-ui-foreground md:h-12 md:w-12" />
                  ) : (
                    <div
                    className={`${
                        actualLevel === level || manualLevel === level
                          ? "text-ui-foreground"
                          : "text-ui-foreground-muted"
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
                        ? "from-status-good-surface to-transparent"
                        : "from-ui-surface-muted to-transparent"
                    } shadow-inner`}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ViewOverlayShell>
  );
};
