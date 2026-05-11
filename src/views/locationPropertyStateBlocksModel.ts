import { useMemo } from "react";
import { useViewStore } from "../stores/viewStore";
import type { ViewId } from "../types/view";
import type { LocationPropertyHistoryControlDefinition } from "./controls/controlDefinitions";
import { useLocationPropertyHistoryControlModel } from "./controls/location-property-history/model";
import { createLocationPropertySidebarDefinitions } from "./controls/location-property-history/sidebarDefinitions";

export type SidebarShape = "single" | "first" | "middle" | "last";

export const getSidebarShapeClassName = (shape: SidebarShape): string => {
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

export interface LocationPropertyStateEntry {
  definition: LocationPropertyHistoryControlDefinition;
  model: ReturnType<typeof useLocationPropertyHistoryControlModel>;
}

export const useLocationPropertyStateBlocks = (
  viewId: ViewId,
  activeControlId: string | null
) => {
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

  const entries = useMemo<LocationPropertyStateEntry[]>(
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

  return { definitions, entries, activeDefinition };
};
