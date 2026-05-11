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
  "pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-50";
const INACTIVE_ACTION_BUTTON_CLASS =
  "border-ui-border-subtle bg-ui-surface-panel text-ui-foreground shadow-xl hover:bg-ui-surface-muted";
const ACTIVE_ACTION_BUTTON_CLASS =
  "border-semantic-active-solid bg-status-good-surface text-status-good-foreground shadow-[0_0_36px_var(--color-semantic-active-glow)] hover:brightness-110";
const MANUAL_ACTION_BUTTON_CLASS =
  "border-ui-warning-border bg-status-moderate-surface text-status-moderate-foreground shadow-[0_0_36px_var(--color-ui-warning-solid)] hover:brightness-110";

const getManualLevelButtonClassName = (
  level: Exclude<HeliosManualLevel, -1>,
  manualLevel: HeliosManualLevel | null,
  actualLevel: HeliosManualLevel | null
): string => {
  if (manualLevel === -1 && actualLevel === level) {
    return ACTIVE_ACTION_BUTTON_CLASS;
  }
  if (manualLevel !== null && manualLevel !== -1 && manualLevel === level) {
    return MANUAL_ACTION_BUTTON_CLASS;
  }
  return INACTIVE_ACTION_BUTTON_CLASS;
};

const getManualLevelIconClassName = (
  level: Exclude<HeliosManualLevel, -1>,
  manualLevel: HeliosManualLevel | null,
  actualLevel: HeliosManualLevel | null
): string => {
  if (manualLevel === -1 && actualLevel === level) {
    return "text-status-good-foreground";
  }
  if (manualLevel !== null && manualLevel !== -1 && manualLevel === level) {
    return "text-status-moderate-foreground";
  }
  return "text-ui-foreground-muted";
};

interface VentilationHudControlProps {
  definition: VentilationControlDefinition;
  interactive?: boolean;
  variant?: "default" | "compact";
  onOpenControl: (controlId: string) => void;
}

interface VentilationOverlayControlProps {
  definition: VentilationControlDefinition;
  onClose: () => void;
}

export const VentilationHudControl = ({
  definition,
  interactive = true,
  variant = "default",
  onOpenControl,
}: VentilationHudControlProps) => {
  const { badge } = useVentilationControlModel(definition);
  const isCompact = variant === "compact";
  const fanSizeClass = isCompact
    ? "h-14 w-14 md:h-16 md:w-16"
    : "h-16 w-16 md:h-20 md:w-20";
  const badgeClass = isCompact
    ? "bottom-0 right-0 px-1.5 py-0 text-[10px] md:text-xs"
    : "bottom-1 right-0 px-1.5 py-0.5 text-xs md:text-sm";

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
      <FaFan className={fanSizeClass} />
      <span
        className={`absolute rounded-full border border-ui-border-subtle bg-ui-surface-image-strong font-bold text-ui-foreground ${badgeClass} ${TEXT_SHADOW_CLASS}`}
      >
        {badge}
      </span>
    </button>
  );
};

const getFanIcon = (level: HeliosManualLevel) => {
  const iconClassName = "h-16 w-16 md:h-24 md:w-24";
  const stageBadgeClassName =
    "absolute -bottom-2 -right-2 text-xl font-black leading-none text-current md:text-2xl";

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
        className="pointer-events-none relative min-h-full w-full md:h-full md:overflow-hidden"
      >
        <div className="pointer-events-none flex min-h-full w-full grid-cols-4 flex-col gap-3 p-4 pt-16 md:grid md:h-full md:min-h-0 md:gap-3 md:p-3">
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

          <section className="pointer-events-none grid min-h-32 grid-rows-[minmax(0,1fr)] gap-2 md:h-full md:min-h-0">
            <button
              type="button"
              data-testid="ventilation-control-auto"
              onClick={() => {
                void setManualLevel(-1);
              }}
              disabled={sending}
              className={`${OVERLAY_ACTION_BUTTON_CLASS} ${
                manualLevel === -1
                  ? ACTIVE_ACTION_BUTTON_CLASS
                  : INACTIVE_ACTION_BUTTON_CLASS
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

          <section className="pointer-events-none grid min-h-72 grid-cols-2 gap-2 overflow-hidden md:h-full md:min-h-0 md:grid-cols-1 md:grid-rows-[repeat(5,minmax(0,1fr))]">
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
                  getManualLevelButtonClassName(level, manualLevel, actualLevel)
                }`}
                aria-label={`${definition.label} auf ${HELIOS_MANUAL_LEVEL_LABELS[level]} setzen`}
              >
                {sending ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-ui-border-strong border-t-ui-foreground md:h-10 md:w-10" />
                ) : (
                  <span
                    className={getManualLevelIconClassName(
                      level,
                      manualLevel,
                      actualLevel
                    )}
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
