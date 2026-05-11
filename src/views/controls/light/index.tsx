import {
  MdEmojiObjects,
  MdOutlineLightbulb,
  MdPowerSettingsNew,
} from "react-icons/md";
import type { CSSProperties } from "react";
import ViewOverlayShell from "../../ViewOverlayShell";
import type {
  DimmerControlDefinition,
  LightControlDefinition,
} from "../controlDefinitions";
import {
  HorizontalChannelSlider,
  VerticalChannelSlider,
} from "../VerticalChannelSlider";
import { useDimmerControlModel, useLightControlModel } from "./model";

interface LightHudControlProps {
  definition: LightControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  variant?: "default" | "compact";
  onOpenControl: (controlId: string) => void;
}

interface LightOverlayControlProps {
  definition: LightControlDefinition;
  onClose: () => void;
}

interface DimmerHudControlProps {
  definition: DimmerControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  variant?: "default" | "compact";
  onOpenControl: (controlId: string) => void;
}

interface DimmerOverlayControlProps {
  definition: DimmerControlDefinition;
  onClose: () => void;
}

const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

export const LightHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  variant = "default",
  onOpenControl,
}: LightHudControlProps) => {
  const { isOn, sending, toggleLight } = useLightControlModel(definition);
  const isDisabled = sending || disabled;
  const hudState = isOn ? "light-on" : "light-off";
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
      data-testid={`living-control-placeholder-${definition.itemRefs.itemName}`}
      disabled={isDisabled}
      onClick={() => {
        if (!interactive) {
          return;
        }
        if (definition.interaction === "direct-toggle") {
          void toggleLight();
          return;
        }
        onOpenControl(definition.controlId);
      }}
      className="flex items-center justify-center"
      aria-label={`${definition.label} (Licht steuern)`}
    >
      <span
        className={`pointer-events-auto flex ${surfaceSizeClass} items-center justify-center rounded-full backdrop-blur-sm transition ${
          isOn
            ? "bg-semantic-light-solid shadow-[0_0_90px_28px_var(--color-semantic-light-glow)] hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
      >
        {isOn ? (
          <MdEmojiObjects
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className={`${iconSizeClass} text-ui-surface-shell`}
          />
        ) : (
          <MdOutlineLightbulb
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className={`${iconSizeClass} text-ui-foreground`}
          />
        )}
      </span>
    </button>
  );
};

export const DimmerHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  variant = "default",
  onOpenControl,
}: DimmerHudControlProps) => {
  const { isOn, brightness } = useDimmerControlModel(definition);
  const hudState = isOn ? "dimmer-on" : "dimmer-off";
  const isCompact = variant === "compact";
  const surfaceSizeClass = isCompact
    ? "h-14 w-14 md:h-16 md:w-16"
    : "h-20 w-20 md:h-24 md:w-24";
  const iconSizeClass = isCompact
    ? "h-7 w-7 md:h-8 md:w-8"
    : "h-10 w-10 md:h-12 md:w-12";
  const intensity = Math.max(0.18, brightness / 100);
  const dimmerGlowStyle = {
    "--dimmer-intensity": intensity,
    "--dimmer-fill-mix": `${34 + intensity * 66}%`,
    "--dimmer-shadow-blur": `${40 + intensity * 60}px`,
    "--dimmer-shadow-spread": `${10 + intensity * 24}px`,
    "--dimmer-shadow-mix": `${20 + intensity * 60}%`,
  } as CSSProperties;

  return (
    <button
      type="button"
      data-testid={`living-control-placeholder-${definition.itemRefs.itemName}`}
      disabled={disabled}
      onClick={() => {
        if (!interactive) {
          return;
        }
        onOpenControl(definition.controlId);
      }}
      className="flex items-center justify-center"
      aria-label={`${definition.label} (Dimmer steuern)`}
    >
      <span
        data-testid={`living-control-dimmer-glow-${definition.itemRefs.itemName}`}
        className={`pointer-events-auto flex ${surfaceSizeClass} items-center justify-center rounded-full backdrop-blur-sm transition ${
          isOn
            ? "dimmer-glow hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
        style={isOn ? dimmerGlowStyle : undefined}
      >
        {isOn ? (
          <MdEmojiObjects
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className={`${iconSizeClass} text-ui-surface-shell`}
          />
        ) : (
          <MdOutlineLightbulb
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className={`${iconSizeClass} text-ui-foreground`}
          />
        )}
      </span>
    </button>
  );
};

export const LightOverlayControl = ({
  definition,
  onClose,
}: LightOverlayControlProps) => {
  const { isOn, dimPercent, sending, toggleLight } = useLightControlModel(definition);

  return (
    <ViewOverlayShell onClose={onClose} layout="dialog">
      <div className="grid w-full grid-cols-12 gap-6 p-2 md:p-6">
        <div className="col-span-12 text-center">
          <h2 className="text-2xl font-bold text-ui-foreground [text-shadow:0_2px_8px_var(--color-ui-shadow-text)] md:text-3xl">
            {definition.label}
          </h2>
        </div>

        <div className="col-span-12 grid place-items-center">
          <button
            type="button"
            data-testid={`light-control-${definition.controlId}`}
            onClick={() => {
              void toggleLight();
            }}
            disabled={sending}
            className="pointer-events-auto flex min-w-28 flex-col items-center rounded-2xl border border-ui-border-subtle bg-ui-foreground px-4 py-3 text-ui-surface-shell shadow-2xl transition hover:scale-[1.02] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label={`${definition.label} Licht ${isOn ? "ausschalten" : "einschalten"}`}
          >
            <span className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ui-surface-shell">
              {definition.label}
            </span>
            {isOn ? (
              <MdEmojiObjects
                data-testid={`light-control-${definition.controlId}-icon-on`}
                className="h-10 w-10 text-semantic-light-solid"
              />
            ) : (
              <MdOutlineLightbulb
                data-testid={`light-control-${definition.controlId}-icon-off`}
                className="h-10 w-10 text-ui-surface-shell"
              />
            )}
            {dimPercent !== null ? (
              <span
                data-testid={`light-control-${definition.controlId}-dimmer`}
                className="mt-2 text-sm font-bold text-ui-surface-shell"
              >
                {dimPercent}%
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </ViewOverlayShell>
  );
};

export const DimmerOverlayControl = ({
  definition,
  onClose,
}: DimmerOverlayControlProps) => {
  const { isOn, brightness, sending, toggleDimmer, setBrightness } =
    useDimmerControlModel(definition);

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`dimmer-control-${definition.controlId}`}
        className="pointer-events-none flex min-h-full w-full grid-cols-4 flex-col gap-3 p-4 pt-16 md:grid md:h-full md:min-h-0 md:gap-3 md:p-3"
      >
        <section className="pointer-events-none flex flex-col items-start justify-start">
          <p className="text-xs font-semibold tracking-wide text-ui-foreground-muted md:text-sm">
            {definition.label}
          </p>
          <p
            data-testid={`dimmer-control-${definition.controlId}-state`}
            className={`text-4xl font-bold text-ui-foreground md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
          >
            {isOn ? "Ein" : "Aus"}
          </p>
          <div className="mt-8 space-y-2 text-lg font-semibold text-ui-foreground-muted">
            <p data-testid={`dimmer-control-${definition.controlId}-brightness-value`}>
              B {brightness}
            </p>
          </div>
        </section>

        <section className="pointer-events-none grid min-h-40 grid-rows-[minmax(0,1fr)] md:h-full md:min-h-0">
          <button
            type="button"
            data-testid={`dimmer-control-${definition.controlId}-toggle`}
            onClick={() => {
              void toggleDimmer();
            }}
            disabled={sending}
            className={`pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border border-ui-border-subtle transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 ${
              isOn
                ? "bg-semantic-light-solid text-ui-surface-shell shadow-[0_0_90px_20px_var(--color-semantic-light-glow)]"
                : "bg-ui-surface-overlay text-ui-foreground"
            }`}
            aria-label={`${definition.label} ${isOn ? "ausschalten" : "einschalten"}`}
          >
            <MdPowerSettingsNew className="h-[72%] w-[72%] max-h-[9rem] max-w-[9rem] md:max-h-[11rem] md:max-w-[11rem]" />
          </button>
        </section>

        <div className="pointer-events-auto md:hidden">
          <HorizontalChannelSlider
            label="Brightness"
            testId={`dimmer-control-${definition.controlId}-brightness-mobile`}
            value={brightness}
            min={0}
            max={100}
            trackClassName="bg-scale-lightness"
            disabled={false}
            onChange={(value, force) => {
              setBrightness(value, force);
            }}
          />
        </div>

        <div className="hidden min-h-0 md:grid md:h-full md:grid-rows-[minmax(0,1fr)]">
          <VerticalChannelSlider
            label="Brightness"
            testId={`dimmer-control-${definition.controlId}-brightness`}
            value={brightness}
            min={0}
            max={100}
            trackClassName="bg-scale-lightness"
            disabled={false}
            onChange={(value, force) => {
              setBrightness(value, force);
            }}
          />
        </div>

        <section className="pointer-events-none" aria-hidden="true" />
      </div>
    </ViewOverlayShell>
  );
};
