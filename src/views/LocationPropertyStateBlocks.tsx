import type { LocationPropertyHistoryControlDefinition } from "./controls/controlDefinitions";
import { LocationPropertyHistoryOverlayControl } from "./controls/location-property-history";
import {
  getSidebarShapeClassName,
  type LocationPropertyStateEntry,
  type SidebarShape,
} from "./locationPropertyStateBlocksModel";

const TEST_ID_SUFFIX_BY_METRIC_KEY = {
  temperature: "temp",
  humidity: "humidity",
  illuminance: "illuminance",
  rain: "rain",
  wind: "wind",
  co2: "co2",
  "air-quality": "health",
} as const;

interface LocationPropertyStateBlockProps {
  entry: LocationPropertyStateEntry;
  onOpenControl: (controlId: string) => void;
  shape?: SidebarShape;
  variant?: "sidebar" | "mobile-grid";
}

export const LocationPropertyStateBlock = ({
  entry,
  onOpenControl,
  shape,
  variant = "sidebar",
}: LocationPropertyStateBlockProps) => {
  const { definition, model } = entry;
  const valueClassName =
    definition.metricKey === "air-quality"
      ? "text-2xl md:text-[2rem]"
      : definition.metricKey === "wind"
      ? "text-2xl md:text-[2rem]"
      : "text-3xl md:text-[2.4rem]";
  const isIlluminance = definition.metricKey === "illuminance";
  const isRain = definition.metricKey === "rain";
  const isWind = definition.metricKey === "wind";
  const isAirQuality = definition.metricKey === "air-quality";
  const IlluminanceStateIcon = model.illuminancePresentation?.icon;
  const MetricIcon = model.icon;
  const shapeClassName =
    variant === "sidebar" && shape ? getSidebarShapeClassName(shape) : "";
  const blockClassName =
    variant === "sidebar"
      ? `min-h-24 w-full gap-4 border-r px-5 py-4 ${shapeClassName}`
      : "min-h-20 w-full rounded-2xl border px-3 py-3";

  return (
    <button
      type="button"
      data-testid={`hud-metric-${TEST_ID_SUFFIX_BY_METRIC_KEY[definition.metricKey]}`}
      data-illuminance-state={
        isIlluminance ? model.illuminancePresentation?.state ?? "unknown" : undefined
      }
      onClick={() => onOpenControl(definition.controlId)}
      className={`group flex items-center text-left text-ui-foreground backdrop-blur-xl transition hover:brightness-110 ${
        isIlluminance ? "" : "border-ui-border-subtle"
      } ${blockClassName} ${model.tint.block}`}
    >
      <span className="flex min-w-0 flex-1 items-center justify-center">
        {isIlluminance && IlluminanceStateIcon ? (
          <span
            data-testid="hud-metric-illuminance-display-icon"
            className={`flex items-center justify-center ${model.tint.icon}`}
            aria-label={model.illuminancePresentation?.label}
          >
            <IlluminanceStateIcon className="h-10 w-10 md:h-11 md:w-11" />
          </span>
        ) : isRain ? (
          <span
            data-testid="hud-metric-rain-icon"
            className={`flex items-center justify-center ${model.tint.icon}`}
            aria-label={definition.label}
          >
            <MetricIcon className="h-10 w-10 md:h-11 md:w-11" />
          </span>
        ) : isWind ? (
          <span className="flex items-center justify-center gap-2 text-ui-foreground">
            <MetricIcon className="h-8 w-8 shrink-0 text-ui-foreground-muted md:h-9 md:w-9" />
            <span className={`truncate font-semibold leading-none ${valueClassName}`}>
              {model.value}
            </span>
          </span>
        ) : isAirQuality ? (
          <span className="flex flex-col items-center gap-1 text-center text-ui-foreground">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ui-foreground-muted">
              Luft
            </span>
            <span className={`truncate font-semibold leading-none ${valueClassName}`}>
              {model.value}
            </span>
          </span>
        ) : (
          <span
            className={`truncate font-semibold leading-none text-ui-foreground ${valueClassName}`}
          >
            {model.value}
          </span>
        )}
      </span>
    </button>
  );
};

interface LocationPropertyStateOverlayProps {
  activeDefinition: LocationPropertyHistoryControlDefinition | null;
  onClose: () => void;
}

export const LocationPropertyStateOverlay = ({
  activeDefinition,
  onClose,
}: LocationPropertyStateOverlayProps) =>
  activeDefinition ? (
    <LocationPropertyHistoryOverlayControl
      definition={activeDefinition}
      onClose={onClose}
    />
  ) : null;
