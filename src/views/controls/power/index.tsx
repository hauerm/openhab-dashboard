import { useState } from "react";
import { MdPowerSettingsNew } from "react-icons/md";
import { toast } from "react-toastify";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { PowerControlDefinition } from "../controlDefinitions";
import { sendViewItemCommand } from "../viewItemCommand";
import { usePowerControlModel } from "./model";

const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

interface PowerHudControlProps {
  definition: PowerControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  variant?: "default" | "compact";
  onOpenControl: (controlId: string) => void;
}

interface PowerOverlayControlProps {
  definition: PowerControlDefinition;
  onClose: () => void;
}

const renderPowerInfo = ({
  itemName,
  isOn,
  consumptionDisplay,
}: {
  itemName: string;
  isOn: boolean;
  consumptionDisplay: string | null;
}) => {
  if (!isOn || !consumptionDisplay) {
    return null;
  }

  return (
    <span className="min-w-0 max-w-[12rem] text-left md:max-w-[15rem]">
      <span
        className={`block truncate text-2xl font-bold text-ui-foreground md:text-3xl ${TITLE_TEXT_SHADOW_CLASS}`}
        data-testid={`living-control-power-large-${itemName}`}
      >
        {consumptionDisplay}
      </span>
    </span>
  );
};

export const PowerHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  variant = "default",
  onOpenControl,
}: PowerHudControlProps) => {
  const { isOn, consumptionDisplay } = usePowerControlModel(definition);
  const itemName = definition.itemRefs.powerItemName;
  const isCompact = variant === "compact";
  const surfaceSizeClass = isCompact
    ? "h-14 w-14 md:h-16 md:w-16"
    : "h-20 w-20 md:h-24 md:w-24";
  const iconSizeClass = isCompact
    ? "h-7 w-7 md:h-8 md:w-8"
    : "h-10 w-10 md:h-12 md:w-12";

  return (
    <button
      type="button"
      data-testid={`living-control-placeholder-${itemName}`}
      onClick={() => {
        if (!interactive) {
          return;
        }
        onOpenControl(definition.controlId);
      }}
      disabled={disabled}
      className="flex items-center gap-3 md:gap-4"
      aria-label={`${definition.label} (Strom steuern)`}
    >
      <span
        className={`pointer-events-auto flex ${surfaceSizeClass} items-center justify-center rounded-full backdrop-blur-sm transition ${
          isOn
            ? "bg-status-good-surface shadow-[0_0_84px_20px_var(--color-semantic-active-glow)] hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
      >
        <MdPowerSettingsNew
          data-testid={`living-control-placeholder-icon-${itemName}-${isOn ? "power-on" : "power-off"}`}
          className={`${iconSizeClass} ${
            isOn
              ? "text-semantic-active-solid drop-shadow-[0_0_14px_var(--color-semantic-active-glow)]"
              : "text-ui-foreground"
          }`}
        />
      </span>
      {isCompact
        ? null
        : renderPowerInfo({
            itemName,
            isOn,
            consumptionDisplay,
          })}
    </button>
  );
};

export const PowerOverlayControl = ({
  definition,
  onClose,
}: PowerOverlayControlProps) => {
  const [sending, setSending] = useState(false);
  const { isOn, consumptionDisplay } = usePowerControlModel(definition);
  const itemName = definition.itemRefs.powerItemName;
  const stateLabel = isOn ? "Ein" : "Aus";

  const togglePower = async () => {
    if (sending) {
      return;
    }

    const command = isOn ? "OFF" : "ON";
    try {
      setSending(true);
      await sendViewItemCommand(itemName, command, "OnOff", {
        optimisticRawState: command,
      });
    } catch (error) {
      void error;
      toast.error(`Befehl fuer ${definition.label} konnte nicht gesendet werden.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`living-power-overlay-${itemName}`}
        className="pointer-events-none relative min-h-full w-full md:h-full md:overflow-hidden"
      >
        <div className="pointer-events-none flex min-h-full w-full grid-cols-4 flex-col gap-3 p-4 pt-16 md:grid md:h-full md:min-h-0 md:gap-3 md:p-3">
          <section className="pointer-events-none flex flex-col items-start justify-start">
            <p className="text-xs font-semibold tracking-wide text-ui-foreground-muted md:text-sm">
              {definition.label}
            </p>
            <p
              data-testid={`living-power-overlay-state-${itemName}`}
              className={`text-4xl font-bold text-ui-foreground md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
            >
              {stateLabel}
            </p>
            {consumptionDisplay ? (
              <div className="mt-4 text-ui-foreground">
                <p
                  className="text-base font-semibold text-ui-foreground md:text-xl"
                  data-testid={`living-power-overlay-consumption-${itemName}`}
                >
                  {consumptionDisplay}
                </p>
              </div>
            ) : null}
          </section>

          <section className="pointer-events-none grid min-h-44 grid-rows-[minmax(0,1fr)] gap-2 md:h-full md:min-h-0">
            <button
              type="button"
              data-testid={`living-power-overlay-power-${itemName}`}
              onClick={() => {
                void togglePower();
              }}
              disabled={sending}
              className="pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border border-ui-border-subtle bg-ui-surface-panel text-ui-foreground transition hover:bg-ui-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
              aria-label={
                isOn ? `${definition.label} ausschalten` : `${definition.label} einschalten`
              }
            >
              <MdPowerSettingsNew
                className={`h-[80%] w-[80%] max-h-[10rem] max-w-[10rem] md:max-h-[12rem] md:max-w-[12rem] ${
                  isOn ? "text-semantic-active-solid" : "text-ui-foreground"
                }`}
              />
            </button>
          </section>

          <section className="pointer-events-none" aria-hidden="true" />
          <section className="pointer-events-none" aria-hidden="true" />
        </div>
      </div>
    </ViewOverlayShell>
  );
};
