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
const OVERLAY_ACTION_BUTTON_CLASS =
  "pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border border-ui-border-subtle bg-ui-surface-panel text-ui-foreground shadow-xl backdrop-blur-md transition hover:bg-ui-surface-muted disabled:cursor-not-allowed disabled:opacity-50";
const ACTIVE_ACTION_BUTTON_CLASS =
  "border-semantic-active-solid bg-status-good-surface shadow-[0_0_36px_var(--color-semantic-active-glow)]";

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
  const { badge } = useVentilationControlModel(definition);

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
    useVentilationControlModel(definition);
  const manualButtons: Exclude<HeliosManualLevel, -1>[] = [0, 1, 2, 3, 4];
  const currentLevelLabel =
    actualLevel === null ? "--" : HELIOS_MANUAL_LEVEL_LABELS[actualLevel];
  const manualModeLabel =
    manualLevel === -1
      ? "Automatik"
      : manualLevel === null
      ? "--"
      : HELIOS_MANUAL_LEVEL_LABELS[manualLevel];

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid="ventilation-overlay"
        className="pointer-events-none relative h-full w-full overflow-hidden"
      >
        <div className="pointer-events-none grid h-full min-h-0 w-full grid-cols-4 gap-2 p-2 md:gap-3 md:p-3">
          <section className="pointer-events-none flex flex-col items-start justify-start">
            <p className="text-xs font-semibold tracking-wide text-ui-foreground-muted md:text-sm">
              {definition.label}
            </p>
            <p
              data-testid="ventilation-overlay-status"
              className={`text-4xl font-bold text-ui-foreground md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
            >
              {currentLevelLabel}
            </p>
            <p
              data-testid="ventilation-overlay-mode"
              className="mt-2 text-sm font-semibold text-ui-foreground-muted md:text-lg"
            >
              {manualModeLabel}
            </p>
          </section>

          <section className="pointer-events-none grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-2">
            <button
              type="button"
              data-testid="ventilation-control-auto"
              onClick={() => {
                void setManualLevel(-1);
              }}
              disabled={sending}
              className={`${OVERLAY_ACTION_BUTTON_CLASS} ${
                manualLevel === -1 ? ACTIVE_ACTION_BUTTON_CLASS : ""
              }`}
              aria-label={`${definition.label} auf Automatik setzen`}
            >
              {sending ? (
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-ui-border-strong border-t-ui-foreground md:h-12 md:w-12" />
              ) : (
                <MdAutoMode className="h-[70%] w-[70%] max-h-[12rem] max-w-[12rem] md:max-h-[14rem] md:max-w-[14rem]" />
              )}
            </button>
          </section>

          <section className="pointer-events-none grid h-full min-h-0 grid-rows-[repeat(5,minmax(0,1fr))] gap-2 overflow-hidden">
            {manualButtons.map((level) => (
              <button
                key={level}
                type="button"
                data-testid={`ventilation-control-manual-${level}`}
                onClick={() => {
                  void setManualLevel(level);
                }}
                disabled={sending}
                className={`${OVERLAY_ACTION_BUTTON_CLASS} ${
                  manualLevel === level
                    ? "border-ui-border-strong bg-ui-surface-muted shadow-2xl"
                    : ""
                }`}
                aria-label={`${definition.label} auf ${HELIOS_MANUAL_LEVEL_LABELS[level]} setzen`}
              >
                {sending ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-ui-border-strong border-t-ui-foreground md:h-10 md:w-10" />
                ) : (
                  <span
                    className={
                      manualLevel === level
                        ? "text-ui-foreground"
                        : "text-ui-foreground-muted"
                    }
                  >
                    {getFanIcon(level)}
                  </span>
                )}
              </button>
            ))}
          </section>

          <section className="pointer-events-none" aria-hidden="true" />
        </div>
      </div>
    </ViewOverlayShell>
  );
};
