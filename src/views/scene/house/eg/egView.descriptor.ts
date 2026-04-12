import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "../../../../domain/openhab-properties";
import {
  type LocationPropertyHistoryControlDefinition,
  type VentilationControlDefinition,
  collectTrackedItemNamesFromControlDefinitions,
} from "../../controls/controlDefinitions";

export const EG_SCOPE_KEY = "EG";

export const EG_VIEW_CONTROL_DEFINITIONS: readonly (
  | LocationPropertyHistoryControlDefinition
  | VentilationControlDefinition
)[] = [
  {
    controlId: "eg-location-property-temperature",
    controlType: "location-property-history",
    label: "Temperatur",
    metricKey: "temperature",
    property: PROPERTY_TEMPERATURE,
    location: EG_SCOPE_KEY,
    title: "Temperatur EG",
    comfortBand: { min: 20, max: 24, label: "Komfortzone" },
    itemRefs: {},
    layoutMetadataItemNames: [],
    defaultPosition: { x: 14, y: 14 },
  },
  {
    controlId: "eg-location-property-humidity",
    controlType: "location-property-history",
    label: "Luftfeuchtigkeit",
    metricKey: "humidity",
    property: PROPERTY_HUMIDITY,
    location: EG_SCOPE_KEY,
    title: "Luftfeuchte EG",
    itemRefs: {},
    layoutMetadataItemNames: [],
    defaultPosition: { x: 14, y: 30 },
  },
  {
    controlId: "eg-location-property-co2",
    controlType: "location-property-history",
    label: "CO₂",
    metricKey: "co2",
    property: PROPERTY_CO2,
    location: EG_SCOPE_KEY,
    title: "CO₂ EG",
    itemRefs: {},
    layoutMetadataItemNames: [],
    defaultPosition: { x: 14, y: 46 },
  },
  {
    controlId: "eg-location-property-air-quality",
    controlType: "location-property-history",
    label: "Luftqualität",
    metricKey: "air-quality",
    property: PROPERTY_AIR_QUALITY,
    location: EG_SCOPE_KEY,
    title: "Air Quality EG",
    itemRefs: {},
    layoutMetadataItemNames: [],
    defaultPosition: { x: 14, y: 62 },
  },
  {
    controlId: "eg-ventilation",
    controlType: "ventilation",
    label: "Lüftung",
    itemRefs: {},
    layoutMetadataItemNames: [],
    defaultPosition: { x: 88, y: 14 },
  },
] as const;

export const EG_VIEW_TRACKED_ITEM_NAMES =
  collectTrackedItemNamesFromControlDefinitions(EG_VIEW_CONTROL_DEFINITIONS);
