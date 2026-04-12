import {
  Astro_Sun_Data_Sonnenphase,
  KNX_Wetterstation_Aussentemperatur,
  KNX_Wetterstation_Helligkeit,
  KNX_Wetterstation_Regen,
} from "../../domain/hauer-items";
import {
  type ViewMetricControlDefinition,
  collectTrackedItemNamesFromControlDefinitions,
} from "../controls/controlDefinitions";

export const HOUSE_VIEW_CONTROL_DEFINITIONS: readonly ViewMetricControlDefinition[] = [
  {
    controlId: "house-metric-outside-temperature",
    controlType: "view-metric",
    label: "Außen",
    metricKey: "house-temperature",
    itemRefs: {
      primaryItemName: KNX_Wetterstation_Aussentemperatur,
    },
    layoutMetadataItemNames: [KNX_Wetterstation_Aussentemperatur],
    defaultPosition: { x: 11, y: 10 },
  },
  {
    controlId: "house-metric-weather",
    controlType: "view-metric",
    label: "Wetter",
    metricKey: "house-weather",
    itemRefs: {
      primaryItemName: KNX_Wetterstation_Regen,
      secondaryItemName: KNX_Wetterstation_Helligkeit,
    },
    layoutMetadataItemNames: [KNX_Wetterstation_Regen],
    defaultPosition: { x: 11, y: 20 },
  },
  {
    controlId: "house-metric-night-status",
    controlType: "view-metric",
    label: "Status",
    metricKey: "house-night-status",
    itemRefs: {
      primaryItemName: Astro_Sun_Data_Sonnenphase,
    },
    layoutMetadataItemNames: [Astro_Sun_Data_Sonnenphase],
    defaultPosition: { x: 11, y: 30 },
  },
] as const;

export const HOUSE_VIEW_TRACKED_ITEM_NAMES =
  collectTrackedItemNamesFromControlDefinitions(HOUSE_VIEW_CONTROL_DEFINITIONS);
