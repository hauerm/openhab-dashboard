import {
  Astro_Sun_Data_Sonnenphase,
  KNX_Wetterstation_Aussentemperatur,
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
    controlId: "house-metric-night-status",
    controlType: "view-metric",
    label: "Status",
    metricKey: "house-night-status",
    itemRefs: {
      primaryItemName: Astro_Sun_Data_Sonnenphase,
    },
    layoutMetadataItemNames: [Astro_Sun_Data_Sonnenphase],
    defaultPosition: { x: 11, y: 20 },
  },
] as const;

export const HOUSE_VIEW_TRACKED_ITEM_NAMES =
  collectTrackedItemNamesFromControlDefinitions(HOUSE_VIEW_CONTROL_DEFINITIONS);
