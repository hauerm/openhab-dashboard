import { useEffect, useMemo } from "react";
import { createLocationPropertyHistoryStore } from "../../../../stores/locationPropertyHistoryStore";
import { useVentilationStore } from "../../../../stores/ventilationStore";
import { LOCATION_PROPERTY_CONTROL_CONFIGS } from "../../../../config/locationPropertyControlTypes";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "../../../../services/config";
import {
  formatEgCo2Value,
  formatEgHealthStatus,
  formatEgHumidityValue,
  formatEgTemperatureValue,
  formatVentilationBadge,
  resolveEgCo2Tint,
  resolveEgHealthTint,
  resolveEgHumidityTint,
  resolveEgTemperatureTint,
} from "./egHud.formatters";

const EG_SCOPE_KEY = "EG";

type EgSceneControlKind = "location-property-history" | "ventilation";
type EgLocationPropertyMetricKey =
  | "temperature"
  | "humidity"
  | "co2"
  | "air-quality";

interface EgSceneControlBase {
  kind: EgSceneControlKind;
  controlId: string;
  overlayId: string;
  label: string;
  metadataItemNames: string[];
  defaultPosition: { x: number; y: number };
}

export interface EgLocationPropertyHistoryControlDescriptor
  extends EgSceneControlBase {
  kind: "location-property-history";
  metricKey: EgLocationPropertyMetricKey;
  property: string;
  title: string;
  value: string;
  tint: { container: string; icon: string };
  comfortBand?: { min: number; max: number; label?: string };
}

export interface EgVentilationControlDescriptor extends EgSceneControlBase {
  kind: "ventilation";
  badge: string;
}

export type EgSceneControlDescriptor =
  | EgLocationPropertyHistoryControlDescriptor
  | EgVentilationControlDescriptor;

export interface EgViewStoreState {
  controls: EgSceneControlDescriptor[];
}

const EG_CONTROL_IDS = {
  temperature: "eg-location-property-temperature",
  humidity: "eg-location-property-humidity",
  co2: "eg-location-property-co2",
  "air-quality": "eg-location-property-air-quality",
  ventilation: "eg-ventilation",
} as const;

const EG_OVERLAY_IDS = {
  temperature: "control:eg:location-property:temperature",
  humidity: "control:eg:location-property:humidity",
  co2: "control:eg:location-property:co2",
  "air-quality": "control:eg:location-property:air-quality",
  ventilation: "control:eg:ventilation",
} as const;

const EG_DEFAULT_POSITION_BY_CONTROL_ID: Record<string, { x: number; y: number }> = {
  [EG_CONTROL_IDS.temperature]: { x: 14, y: 14 },
  [EG_CONTROL_IDS.humidity]: { x: 14, y: 30 },
  [EG_CONTROL_IDS.co2]: { x: 14, y: 46 },
  [EG_CONTROL_IDS["air-quality"]]: { x: 14, y: 62 },
  [EG_CONTROL_IDS.ventilation]: { x: 88, y: 14 },
};

const toSortedArray = (itemNames: Set<string>): string[] =>
  Array.from(itemNames).sort((a, b) => a.localeCompare(b));

export const useEgViewStore = (): EgViewStoreState => {
  const tempStore = useMemo(
    () =>
      createLocationPropertyHistoryStore(
        LOCATION_PROPERTY_CONTROL_CONFIGS[PROPERTY_TEMPERATURE],
        EG_SCOPE_KEY
      ),
    []
  );
  const humidityStore = useMemo(
    () =>
      createLocationPropertyHistoryStore(
        LOCATION_PROPERTY_CONTROL_CONFIGS[PROPERTY_HUMIDITY],
        EG_SCOPE_KEY
      ),
    []
  );
  const co2Store = useMemo(
    () =>
      createLocationPropertyHistoryStore(
        LOCATION_PROPERTY_CONTROL_CONFIGS[PROPERTY_CO2],
        EG_SCOPE_KEY
      ),
    []
  );
  const healthStore = useMemo(
    () =>
      createLocationPropertyHistoryStore(
        LOCATION_PROPERTY_CONTROL_CONFIGS[PROPERTY_AIR_QUALITY],
        EG_SCOPE_KEY
      ),
    []
  );

  const initializeTemp = tempStore((state) => state.initialize);
  const initializeHumidity = humidityStore((state) => state.initialize);
  const initializeCo2 = co2Store((state) => state.initialize);
  const initializeHealth = healthStore((state) => state.initialize);

  useEffect(() => {
    void Promise.all([
      initializeTemp(EG_SCOPE_KEY),
      initializeHumidity(EG_SCOPE_KEY),
      initializeCo2(EG_SCOPE_KEY),
      initializeHealth(EG_SCOPE_KEY),
    ]);
  }, [initializeCo2, initializeHealth, initializeHumidity, initializeTemp]);

  const tempValue = tempStore((state) => state.currentValue);
  const humidityValue = humidityStore((state) => state.currentValue);
  const co2Value = co2Store((state) => state.currentValue);
  const healthValue = healthStore((state) => state.currentValue);
  const tempItemNames = tempStore((state) => state.itemNames);
  const humidityItemNames = humidityStore((state) => state.itemNames);
  const co2ItemNames = co2Store((state) => state.itemNames);
  const healthItemNames = healthStore((state) => state.itemNames);

  const ventilationInitialize = useVentilationStore((state) => state.initialize);
  const manualLevel = useVentilationStore((state) => state.manualLevel);
  const actualLevel = useVentilationStore((state) => state.actualLevel);
  const ventilationStoreItemNames = useVentilationStore((state) => state.itemNames);

  useEffect(() => {
    void ventilationInitialize();
  }, [ventilationInitialize]);

  return useMemo(() => {
    const controls: EgSceneControlDescriptor[] = [
      {
        kind: "location-property-history",
        metricKey: "temperature",
        controlId: EG_CONTROL_IDS.temperature,
        overlayId: EG_OVERLAY_IDS.temperature,
        label: "Temperatur",
        property: PROPERTY_TEMPERATURE,
        title: "Temperatur EG",
        value: formatEgTemperatureValue(tempValue),
        tint: resolveEgTemperatureTint(tempValue),
        comfortBand: { min: 20, max: 24, label: "Komfortzone" },
        metadataItemNames: toSortedArray(tempItemNames),
        defaultPosition: EG_DEFAULT_POSITION_BY_CONTROL_ID[EG_CONTROL_IDS.temperature],
      },
      {
        kind: "location-property-history",
        metricKey: "humidity",
        controlId: EG_CONTROL_IDS.humidity,
        overlayId: EG_OVERLAY_IDS.humidity,
        label: "Luftfeuchtigkeit",
        property: PROPERTY_HUMIDITY,
        title: "Luftfeuchte EG",
        value: formatEgHumidityValue(humidityValue),
        tint: resolveEgHumidityTint(humidityValue),
        metadataItemNames: toSortedArray(humidityItemNames),
        defaultPosition: EG_DEFAULT_POSITION_BY_CONTROL_ID[EG_CONTROL_IDS.humidity],
      },
      {
        kind: "location-property-history",
        metricKey: "co2",
        controlId: EG_CONTROL_IDS.co2,
        overlayId: EG_OVERLAY_IDS.co2,
        label: "CO₂",
        property: PROPERTY_CO2,
        title: "CO₂ EG",
        value: formatEgCo2Value(co2Value),
        tint: resolveEgCo2Tint(co2Value),
        metadataItemNames: toSortedArray(co2ItemNames),
        defaultPosition: EG_DEFAULT_POSITION_BY_CONTROL_ID[EG_CONTROL_IDS.co2],
      },
      {
        kind: "location-property-history",
        metricKey: "air-quality",
        controlId: EG_CONTROL_IDS["air-quality"],
        overlayId: EG_OVERLAY_IDS["air-quality"],
        label: "Luftqualität",
        property: PROPERTY_AIR_QUALITY,
        title: "Air Quality EG",
        value: formatEgHealthStatus(healthValue),
        tint: resolveEgHealthTint(healthValue),
        metadataItemNames: toSortedArray(healthItemNames),
        defaultPosition:
          EG_DEFAULT_POSITION_BY_CONTROL_ID[EG_CONTROL_IDS["air-quality"]],
      },
      {
        kind: "ventilation",
        controlId: EG_CONTROL_IDS.ventilation,
        overlayId: EG_OVERLAY_IDS.ventilation,
        label: "Lüftung",
        badge: formatVentilationBadge(manualLevel, actualLevel),
        metadataItemNames: toSortedArray(ventilationStoreItemNames),
        defaultPosition: EG_DEFAULT_POSITION_BY_CONTROL_ID[EG_CONTROL_IDS.ventilation],
      },
    ];

    return { controls };
  }, [
    actualLevel,
    co2ItemNames,
    co2Value,
    healthItemNames,
    healthValue,
    humidityItemNames,
    humidityValue,
    manualLevel,
    tempItemNames,
    tempValue,
    ventilationStoreItemNames,
  ]);
};
