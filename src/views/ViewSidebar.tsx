import { useMemo } from "react";
import { useViewStore } from "../stores/viewStore";
import type { ViewId } from "../types/view";
import { LocationPropertyHistoryOverlayControl } from "./controls/location-property-history";
import { useLocationPropertyHistoryControlModel } from "./controls/location-property-history/model";
import { createLocationPropertySidebarDefinitions } from "./controls/location-property-history/sidebarDefinitions";

export const VIEW_SIDEBAR_SAFE_ZONE_PX = 208;

const TEST_ID_SUFFIX_BY_METRIC_KEY = {
  temperature: "temp",
  humidity: "humidity",
  illuminance: "illuminance",
  rain: "rain",
  wind: "wind",
  co2: "co2",
  "air-quality": "health",
} as const;

type SidebarShape = "single" | "first" | "middle" | "last";

const getSidebarShapeClassName = (shape: SidebarShape): string => {
  switch (shape) {
    case "single":
      return "rounded-r-3xl";
    case "first":
      return "rounded-tr-3xl";
    case "last":
      return "rounded-br-3xl";
    case "middle":
      return "";
  }
};

interface ViewSidebarProps {
  viewId: ViewId;
  activeControlId: string | null;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
}

const ViewSidebar = ({
  viewId,
  activeControlId,
  onOpenControl,
  onCloseControl,
}: ViewSidebarProps) => {
  const viewConfig = useViewStore((state) => state.viewConfigs[viewId]);
  const location = viewConfig?.location?.trim() ?? viewId;
  const locationScope = viewConfig?.locationScope ?? "descendants";

  const definitions = useMemo(
    () =>
      createLocationPropertySidebarDefinitions(viewId, location, locationScope, {
        temperature: "direct",
        humidity: "direct",
        rain: "direct",
        wind: "direct",
        co2: "direct",
        "air-quality": "direct",
      }),
    [location, locationScope, viewId]
  );

  const [
    temperatureDefinition,
    humidityDefinition,
    illuminanceDefinition,
    rainDefinition,
    windDefinition,
    co2Definition,
    airQualityDefinition,
  ] = definitions;

  const temperatureModel = useLocationPropertyHistoryControlModel(temperatureDefinition);
  const humidityModel = useLocationPropertyHistoryControlModel(humidityDefinition);
  const illuminanceModel = useLocationPropertyHistoryControlModel(illuminanceDefinition);
  const rainModel = useLocationPropertyHistoryControlModel(rainDefinition);
  const windModel = useLocationPropertyHistoryControlModel(windDefinition);
  const co2Model = useLocationPropertyHistoryControlModel(co2Definition);
  const airQualityModel = useLocationPropertyHistoryControlModel(airQualityDefinition);

  const entries = useMemo(
    () =>
      [
        { definition: temperatureDefinition, model: temperatureModel },
        { definition: humidityDefinition, model: humidityModel },
        { definition: illuminanceDefinition, model: illuminanceModel },
        { definition: rainDefinition, model: rainModel },
        { definition: windDefinition, model: windModel },
        { definition: co2Definition, model: co2Model },
        { definition: airQualityDefinition, model: airQualityModel },
      ].filter((entry) => entry.model.hasItems && entry.model.isVisibleInSidebar),
    [
      airQualityDefinition,
      airQualityModel,
      co2Definition,
      co2Model,
      humidityDefinition,
      humidityModel,
      illuminanceDefinition,
      illuminanceModel,
      rainDefinition,
      rainModel,
      temperatureDefinition,
      temperatureModel,
      windDefinition,
      windModel,
    ]
  );

  const activeDefinition =
    activeControlId !== null
      ? definitions.find((definition) => definition.controlId === activeControlId) ?? null
      : null;

  if (entries.length === 0) {
    return activeDefinition ? (
      <LocationPropertyHistoryOverlayControl
        definition={activeDefinition}
        onClose={onCloseControl}
      />
    ) : null;
  }

  return (
    <>
      <aside className="pointer-events-none fixed inset-y-0 left-0 z-30 flex items-center">
        <div className="pointer-events-auto max-h-[calc(100vh-1.5rem)] overflow-y-auto pr-4">
          <div
            data-testid="view-sidebar"
            className="flex w-44 flex-col shadow-2xl sm:w-48 md:w-52"
          >
            {entries.map(({ definition, model }, index) => {
              const shape: SidebarShape =
                entries.length === 1
                  ? "single"
                  : index === 0
                  ? "first"
                  : index === entries.length - 1
                  ? "last"
                  : "middle";
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

              return (
                <button
                  key={definition.controlId}
                  type="button"
                  data-testid={`hud-metric-${TEST_ID_SUFFIX_BY_METRIC_KEY[definition.metricKey]}`}
                  data-illuminance-state={
                    isIlluminance
                      ? model.illuminancePresentation?.state ?? "unknown"
                      : undefined
                  }
                  onClick={() => onOpenControl(definition.controlId)}
                  className={`group flex min-h-24 w-full items-center gap-4 border-r px-5 py-4 text-left text-ui-foreground backdrop-blur-xl transition hover:brightness-110 ${
                    isIlluminance ? "" : "border-ui-border-subtle"
                  } ${getSidebarShapeClassName(
                    shape
                  )} ${model.tint.block}`}
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
            })}
          </div>
        </div>
      </aside>

      {activeDefinition ? (
        <LocationPropertyHistoryOverlayControl
          definition={activeDefinition}
          onClose={onCloseControl}
        />
      ) : null}
    </>
  );
};

export default ViewSidebar;
