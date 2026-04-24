import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_TEMPERATURE,
} from "../../../domain/openhab-properties";
import type { LocationScope, ViewId } from "../../../types/view";
import type { LocationPropertyHistoryControlDefinition } from "../controlDefinitions";

type SidebarMetricDefinition = Pick<
  LocationPropertyHistoryControlDefinition,
  "metricKey" | "property" | "label" | "comfortBand"
> & {
  title: string;
};

type SidebarMetricLocationScopes = Partial<
  Record<SidebarMetricDefinition["metricKey"], LocationScope>
>;

const SIDEBAR_LOCATION_METRICS: readonly SidebarMetricDefinition[] = [
  {
    metricKey: "temperature",
    property: PROPERTY_TEMPERATURE,
    label: "Temperatur",
    title: "Temperatur",
    comfortBand: { min: 20, max: 24, label: "Komfortzone" },
  },
  {
    metricKey: "humidity",
    property: PROPERTY_HUMIDITY,
    label: "Luftfeuchte",
    title: "Luftfeuchte",
  },
  {
    metricKey: "illuminance",
    property: PROPERTY_ILLUMINANCE,
    label: "Helligkeit",
    title: "Helligkeit",
  },
  {
    metricKey: "co2",
    property: PROPERTY_CO2,
    label: "CO₂",
    title: "CO₂",
  },
  {
    metricKey: "air-quality",
    property: PROPERTY_AIR_QUALITY,
    label: "Luftqualität",
    title: "Luftqualität",
  },
] as const;

const toSidebarControlId = (viewId: ViewId, metricKey: SidebarMetricDefinition["metricKey"]) =>
  `${viewId}-sidebar-location-property-${metricKey}`;

export const createLocationPropertySidebarDefinitions = (
  viewId: ViewId,
  location: string,
  locationScope: LocationScope = "descendants",
  metricLocationScopes: SidebarMetricLocationScopes = {}
): readonly LocationPropertyHistoryControlDefinition[] =>
  SIDEBAR_LOCATION_METRICS.map((metricDefinition) => ({
    controlId: toSidebarControlId(viewId, metricDefinition.metricKey),
    controlType: "location-property-history",
    label: metricDefinition.label,
    metricKey: metricDefinition.metricKey,
    property: metricDefinition.property,
    location,
    locationScope: metricLocationScopes[metricDefinition.metricKey] ?? locationScope,
    measurementRole:
      metricDefinition.metricKey === "illuminance" ? undefined : "ambient",
    title: `${metricDefinition.title} ${location}`,
    comfortBand: metricDefinition.comfortBand,
    itemRefs: {},
    layoutMetadataItemNames: [],
    defaultPosition: { x: 0, y: 0 },
  }));
