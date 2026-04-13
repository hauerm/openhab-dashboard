import { useMemo } from "react";
import { VIEWS } from "../config/views";
import type { ViewId } from "../types/view";
import { LocationPropertyHistoryOverlayControl } from "./controls/location-property-history";
import { useLocationPropertyHistoryControlModel } from "./controls/location-property-history/model";
import { createLocationPropertySidebarDefinitions } from "./controls/location-property-history/sidebarDefinitions";

export const VIEW_SIDEBAR_SAFE_ZONE_PX = 208;

const TEST_ID_SUFFIX_BY_METRIC_KEY = {
  temperature: "temp",
  humidity: "humidity",
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
  const viewConfig = VIEWS[viewId];
  const location = viewConfig.location!.trim();
  const locationScope = viewConfig.locationScope ?? "descendants";

  const definitions = useMemo(
    () => createLocationPropertySidebarDefinitions(viewId, location, locationScope),
    [location, locationScope, viewId]
  );

  const [
    temperatureDefinition,
    humidityDefinition,
    co2Definition,
    airQualityDefinition,
  ] = definitions;

  const temperatureModel = useLocationPropertyHistoryControlModel(temperatureDefinition);
  const humidityModel = useLocationPropertyHistoryControlModel(humidityDefinition);
  const co2Model = useLocationPropertyHistoryControlModel(co2Definition);
  const airQualityModel = useLocationPropertyHistoryControlModel(airQualityDefinition);

  const entries = useMemo(
    () =>
      [
        { definition: temperatureDefinition, model: temperatureModel },
        { definition: humidityDefinition, model: humidityModel },
        { definition: co2Definition, model: co2Model },
        { definition: airQualityDefinition, model: airQualityModel },
      ].filter((entry) => entry.model.hasItems),
    [
      airQualityDefinition,
      airQualityModel,
      co2Definition,
      co2Model,
      humidityDefinition,
      humidityModel,
      temperatureDefinition,
      temperatureModel,
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
              const Icon = model.icon;
              const valueClassName =
                definition.metricKey === "air-quality"
                  ? "text-2xl md:text-[2rem]"
                  : "text-3xl md:text-[2.4rem]";

              return (
                <button
                  key={definition.controlId}
                  type="button"
                  data-testid={`hud-metric-${TEST_ID_SUFFIX_BY_METRIC_KEY[definition.metricKey]}`}
                  onClick={() => onOpenControl(definition.controlId)}
                  className={`group flex min-h-28 w-full flex-col justify-between border-r border-ui-border-subtle px-4 py-4 text-left text-ui-foreground backdrop-blur-xl transition hover:brightness-110 ${getSidebarShapeClassName(
                    shape
                  )} ${model.tint.block}`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${model.tint.iconContainer}`}
                    >
                      <Icon className={`h-6 w-6 ${model.tint.icon}`} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ui-foreground-muted">
                      {definition.label}
                    </span>
                  </span>

                  <span className="mt-4 flex items-end justify-between gap-3">
                    <span className={`font-semibold leading-none ${valueClassName}`}>
                      {model.value}
                    </span>
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
