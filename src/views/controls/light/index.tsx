import {
  MdEmojiObjects,
  MdOutlineLightbulb,
  MdPowerSettingsNew,
} from "react-icons/md";
import ViewOverlayShell from "../../ViewOverlayShell";
import type {
  DimmerControlDefinition,
  LightControlDefinition,
} from "../controlDefinitions";
import { VerticalChannelSlider } from "../VerticalChannelSlider";
import { useDimmerControlModel, useLightControlModel } from "./model";

interface LightHudControlProps {
  definition: LightControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
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
  onOpenControl,
}: LightHudControlProps) => {
  const { isOn, sending, toggleLight } = useLightControlModel(definition);
  const isDisabled = sending || disabled;
  const hudState = isOn ? "light-on" : "light-off";

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
        className={`pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24 ${
          isOn
            ? "bg-semantic-light-solid shadow-[0_0_90px_28px_var(--color-semantic-light-glow)] hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
      >
        {isOn ? (
          <MdEmojiObjects
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-ui-surface-shell md:h-12 md:w-12"
          />
        ) : (
          <MdOutlineLightbulb
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-ui-foreground md:h-12 md:w-12"
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
  onOpenControl,
}: DimmerHudControlProps) => {
  const { isOn, brightness } = useDimmerControlModel(definition);
  const hudState = isOn ? "dimmer-on" : "dimmer-off";
  const intensity = Math.max(0.18, brightness / 100);

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
        className={`pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24 ${
          isOn
            ? "hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
        style={
          isOn
            ? {
                backgroundColor: `rgba(253, 224, 71, ${0.34 + intensity * 0.66})`,
                boxShadow: `0 0 ${40 + intensity * 60}px ${10 + intensity * 24}px rgba(253, 224, 71, ${0.2 + intensity * 0.6})`,
              }
            : undefined
        }
      >
        {isOn ? (
          <MdEmojiObjects
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-ui-surface-shell md:h-12 md:w-12"
          />
        ) : (
          <MdOutlineLightbulb
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-ui-foreground md:h-12 md:w-12"
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
        className="pointer-events-none grid h-full min-h-0 w-full grid-cols-4 gap-2 p-2 md:gap-3 md:p-3"
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

        <section className="pointer-events-none flex h-full min-h-0 items-center justify-center rounded-2xl border border-ui-border-subtle bg-ui-surface-panel/80 p-5 backdrop-blur-xl">
          <button
            type="button"
            data-testid={`dimmer-control-${definition.controlId}-toggle`}
            onClick={() => {
              void toggleDimmer();
            }}
            disabled={sending}
            className="pointer-events-auto flex aspect-square w-full max-w-56 items-center justify-center rounded-full border border-ui-border-subtle text-ui-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              backgroundColor: isOn
                ? "var(--color-semantic-light-solid)"
                : "var(--color-ui-surface-overlay)",
              boxShadow: isOn
                ? "0 0 90px 20px var(--color-semantic-light-glow)"
                : undefined,
            }}
            aria-label={`${definition.label} ${isOn ? "ausschalten" : "einschalten"}`}
          >
            <MdPowerSettingsNew className="h-1/2 w-1/2" />
          </button>
        </section>

        <VerticalChannelSlider
          label="Brightness"
          testId={`dimmer-control-${definition.controlId}-brightness`}
          value={brightness}
          min={0}
          max={100}
          background="linear-gradient(to bottom, #ffffff, var(--color-ui-surface-shell))"
          disabled={false}
          onChange={(value, force) => {
            setBrightness(value, force);
          }}
        />

        <section className="pointer-events-none" aria-hidden="true" />
      </div>
    </ViewOverlayShell>
  );
};
