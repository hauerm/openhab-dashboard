import type { SVGProps } from "react";
import { MdPowerSettingsNew } from "react-icons/md";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { RgbwLightControlDefinition } from "../controlDefinitions";
import { VerticalChannelSlider } from "../VerticalChannelSlider";
import { useRgbwLightControlModel } from "./model";

interface RgbwLightHudControlProps {
  definition: RgbwLightControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface RgbwLightOverlayControlProps {
  definition: RgbwLightControlDefinition;
  onClose: () => void;
}

const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

const COLOR_SPECTRUM_SEGMENTS = [
  { color: "#ef4444", rotation: 0 },
  { color: "#f97316", rotation: 30 },
  { color: "#f59e0b", rotation: 60 },
  { color: "#84cc16", rotation: 90 },
  { color: "#22c55e", rotation: 120 },
  { color: "#14b8a6", rotation: 150 },
  { color: "#06b6d4", rotation: 180 },
  { color: "#3b82f6", rotation: 210 },
  { color: "#6366f1", rotation: 240 },
  { color: "#8b5cf6", rotation: 270 },
  { color: "#d946ef", rotation: 300 },
  { color: "#ec4899", rotation: 330 },
];

const ColorSpectrumCircleIcon = ({
  className,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {COLOR_SPECTRUM_SEGMENTS.map((segment) => (
      <circle
        key={segment.rotation}
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke={segment.color}
        strokeWidth="22"
        strokeDasharray="15.2 186"
        strokeLinecap="butt"
        transform={`rotate(${segment.rotation} 50 50)`}
      />
    ))}
    <circle
      cx="50"
      cy="50"
      r="21"
      fill="currentColor"
      opacity="0.94"
    />
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      opacity="0.82"
    />
  </svg>
);

export const RgbwLightHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  onOpenControl,
}: RgbwLightHudControlProps) => {
  const { isOn, cssColor } = useRgbwLightControlModel(definition);
  const hudState = isOn ? "rgbw-light-on" : "rgbw-light-off";

  return (
    <button
      type="button"
      data-testid={`living-control-placeholder-${definition.itemRefs.colorItemName}`}
      disabled={disabled}
      onClick={() => {
        if (!interactive) {
          return;
        }
        onOpenControl(definition.controlId);
      }}
      className="flex items-center justify-center"
      aria-label={`${definition.label} (RGBW steuern)`}
    >
      <span
        data-testid={`living-control-rgbw-glow-${definition.itemRefs.colorItemName}`}
        className={`pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24 ${
          isOn
            ? "hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
        style={
          isOn
            ? {
                backgroundColor: cssColor,
                boxShadow: `0 0 90px 28px ${cssColor}`,
              }
            : undefined
        }
      >
        <ColorSpectrumCircleIcon
          data-testid={`living-control-placeholder-icon-${definition.itemRefs.colorItemName}-${hudState}`}
          className={`h-11 w-11 md:h-14 md:w-14 ${
            isOn ? "text-ui-surface-shell" : "text-ui-foreground"
          }`}
        />
      </span>
    </button>
  );
};

export const RgbwLightOverlayControl = ({
  definition,
  onClose,
}: RgbwLightOverlayControlProps) => {
  const {
    color,
    cssColor,
    isOn,
    sending,
    toggle,
    setHue,
    setSaturation,
    setBrightness,
  } = useRgbwLightControlModel(definition);

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`rgbw-light-control-${definition.controlId}`}
        className="pointer-events-none grid h-full min-h-0 w-full grid-cols-5 gap-2 p-2 md:gap-3 md:p-3"
      >
        <section className="pointer-events-none flex flex-col items-start justify-start">
          <p className="text-xs font-semibold tracking-wide text-ui-foreground-muted md:text-sm">
            {definition.label}
          </p>
          <p
            data-testid={`rgbw-light-control-${definition.controlId}-state`}
            className={`text-4xl font-bold text-ui-foreground md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
          >
            {isOn ? "Ein" : "Aus"}
          </p>
          <div className="mt-8 space-y-2 text-lg font-semibold text-ui-foreground-muted">
            <p data-testid={`rgbw-light-control-${definition.controlId}-hue-value`}>
              H {color.hue}
            </p>
            <p data-testid={`rgbw-light-control-${definition.controlId}-saturation-value`}>
              S {color.saturation}
            </p>
            <p data-testid={`rgbw-light-control-${definition.controlId}-brightness-value`}>
              B {color.brightness}
            </p>
          </div>
        </section>

        <section className="pointer-events-none flex h-full min-h-0 items-center justify-center rounded-2xl border border-ui-border-subtle bg-ui-surface-panel/80 p-5 backdrop-blur-xl">
          <button
            type="button"
            data-testid={`rgbw-light-control-${definition.controlId}-toggle`}
            onClick={() => {
              void toggle();
            }}
            disabled={sending}
            className="pointer-events-auto flex aspect-square w-full max-w-56 items-center justify-center rounded-full border border-ui-border-subtle text-ui-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              backgroundColor: isOn ? cssColor : "var(--color-ui-surface-overlay)",
              boxShadow: isOn ? `0 0 90px 20px ${cssColor}` : undefined,
            }}
            aria-label={`${definition.label} ${isOn ? "ausschalten" : "einschalten"}`}
          >
            <MdPowerSettingsNew className="h-1/2 w-1/2" />
          </button>
        </section>

        <VerticalChannelSlider
          label="Hue"
          testId={`rgbw-light-control-${definition.controlId}-hue`}
          value={color.hue}
          min={0}
          max={360}
          background="linear-gradient(to bottom, hsl(360 100% 50%), hsl(300 100% 50%), hsl(240 100% 50%), hsl(180 100% 50%), hsl(120 100% 50%), hsl(60 100% 50%), hsl(0 100% 50%))"
          disabled={false}
          onChange={(value, force) => {
            setHue(value, force);
          }}
        />
        <VerticalChannelSlider
          label="Saturation"
          testId={`rgbw-light-control-${definition.controlId}-saturation`}
          value={color.saturation}
          min={0}
          max={100}
          background={`linear-gradient(to bottom, hsl(${color.hue} 100% 55%), hsl(${color.hue} 0% 55%))`}
          disabled={false}
          onChange={(value, force) => {
            setSaturation(value, force);
          }}
        />
        <VerticalChannelSlider
          label="Brightness"
          testId={`rgbw-light-control-${definition.controlId}-brightness`}
          value={color.brightness}
          min={0}
          max={100}
          background="linear-gradient(to bottom, #ffffff, var(--color-ui-surface-shell))"
          disabled={false}
          onChange={(value, force) => {
            setBrightness(value, force);
          }}
        />
      </div>
    </ViewOverlayShell>
  );
};
