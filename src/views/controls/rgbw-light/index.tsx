import type { CSSProperties, SVGProps } from "react";
import { MdPowerSettingsNew } from "react-icons/md";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { RgbwLightControlDefinition } from "../controlDefinitions";
import {
  HorizontalChannelSlider,
  VerticalChannelSlider,
} from "../VerticalChannelSlider";
import { useRgbwLightControlModel } from "./model";

interface RgbwLightHudControlProps {
  definition: RgbwLightControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  variant?: "default" | "compact";
  onOpenControl: (controlId: string) => void;
}

interface RgbwLightOverlayControlProps {
  definition: RgbwLightControlDefinition;
  onClose: () => void;
}

const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

const COLOR_SPECTRUM_SEGMENTS = [
  { strokeClassName: "stroke-scale-hue-red", rotation: 0 },
  { strokeClassName: "stroke-scale-hue-orange", rotation: 30 },
  { strokeClassName: "stroke-scale-hue-amber", rotation: 60 },
  { strokeClassName: "stroke-scale-hue-lime", rotation: 90 },
  { strokeClassName: "stroke-scale-hue-green", rotation: 120 },
  { strokeClassName: "stroke-scale-hue-teal", rotation: 150 },
  { strokeClassName: "stroke-scale-hue-cyan", rotation: 180 },
  { strokeClassName: "stroke-scale-hue-blue", rotation: 210 },
  { strokeClassName: "stroke-scale-hue-indigo", rotation: 240 },
  { strokeClassName: "stroke-scale-hue-violet", rotation: 270 },
  { strokeClassName: "stroke-scale-hue-fuchsia", rotation: 300 },
  { strokeClassName: "stroke-scale-hue-pink", rotation: 330 },
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
        className={segment.strokeClassName}
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
  variant = "default",
  onOpenControl,
}: RgbwLightHudControlProps) => {
  const { isOn, cssColor } = useRgbwLightControlModel(definition);
  const hudState = isOn ? "rgbw-light-on" : "rgbw-light-off";
  const isCompact = variant === "compact";
  const surfaceSizeClass = isCompact
    ? "h-14 w-14 md:h-16 md:w-16"
    : "h-20 w-20 md:h-24 md:w-24";
  const iconSizeClass = isCompact
    ? "h-8 w-8 md:h-9 md:w-9"
    : "h-11 w-11 md:h-14 md:w-14";

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
        className={`pointer-events-auto flex ${surfaceSizeClass} items-center justify-center rounded-full backdrop-blur-sm transition ${
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
          className={`${iconSizeClass} ${
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
  const saturationSliderStyle = {
    "--slider-hue": color.hue,
  } as CSSProperties;

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`rgbw-light-control-${definition.controlId}`}
        className="pointer-events-none flex min-h-full w-full grid-cols-5 flex-col gap-3 p-4 pt-16 md:grid md:h-full md:min-h-0 md:gap-3 md:p-3"
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

        <section className="pointer-events-none grid min-h-40 grid-rows-[minmax(0,1fr)] md:h-full md:min-h-0">
          <button
            type="button"
            data-testid={`rgbw-light-control-${definition.controlId}-toggle`}
            onClick={() => {
              void toggle();
            }}
            disabled={sending}
            className="pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border border-ui-border-subtle text-ui-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              backgroundColor: isOn ? cssColor : "var(--color-ui-surface-overlay)",
              boxShadow: isOn ? `0 0 90px 20px ${cssColor}` : undefined,
            }}
            aria-label={`${definition.label} ${isOn ? "ausschalten" : "einschalten"}`}
          >
            <MdPowerSettingsNew className="h-[72%] w-[72%] max-h-[9rem] max-w-[9rem] drop-shadow-[0_2px_8px_var(--color-ui-shadow-text)] md:max-h-[11rem] md:max-w-[11rem]" />
          </button>
        </section>

        <div className="pointer-events-auto space-y-3 md:hidden">
          <HorizontalChannelSlider
            label="Hue"
            testId={`rgbw-light-control-${definition.controlId}-hue-mobile`}
            value={color.hue}
            min={0}
            max={360}
            trackClassName="bg-scale-hue"
            disabled={false}
            onChange={(value, force) => {
              setHue(value, force);
            }}
          />
          <HorizontalChannelSlider
            label="Saturation"
            testId={`rgbw-light-control-${definition.controlId}-saturation-mobile`}
            value={color.saturation}
            min={0}
            max={100}
            trackClassName="bg-scale-saturation"
            style={saturationSliderStyle}
            disabled={false}
            onChange={(value, force) => {
              setSaturation(value, force);
            }}
          />
          <HorizontalChannelSlider
            label="Brightness"
            testId={`rgbw-light-control-${definition.controlId}-brightness-mobile`}
            value={color.brightness}
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
            label="Hue"
            testId={`rgbw-light-control-${definition.controlId}-hue`}
            value={color.hue}
            min={0}
            max={360}
            trackClassName="bg-scale-hue"
            disabled={false}
            onChange={(value, force) => {
              setHue(value, force);
            }}
          />
        </div>
        <div className="hidden min-h-0 md:grid md:h-full md:grid-rows-[minmax(0,1fr)]">
          <VerticalChannelSlider
            label="Saturation"
            testId={`rgbw-light-control-${definition.controlId}-saturation`}
            value={color.saturation}
            min={0}
            max={100}
            trackClassName="bg-scale-saturation"
            style={saturationSliderStyle}
            disabled={false}
            onChange={(value, force) => {
              setSaturation(value, force);
            }}
          />
        </div>
        <div className="hidden min-h-0 md:grid md:h-full md:grid-rows-[minmax(0,1fr)]">
          <VerticalChannelSlider
            label="Brightness"
            testId={`rgbw-light-control-${definition.controlId}-brightness`}
            value={color.brightness}
            min={0}
            max={100}
            trackClassName="bg-scale-lightness"
            disabled={false}
            onChange={(value, force) => {
              setBrightness(value, force);
            }}
          />
        </div>
      </div>
    </ViewOverlayShell>
  );
};
