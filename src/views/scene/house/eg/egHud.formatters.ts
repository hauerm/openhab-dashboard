import {
  getBackgroundTintLevel,
  LOCATION_PROPERTY_CONTROL_CONFIGS,
  type BackgroundTintLevel,
} from "../../../../config/locationPropertyControlTypes";
import { getHealthIndexLabel } from "../../../../config/healthIndex";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "../../../../services/config";
import {
  HELIOS_MANUAL_LEVEL_LABELS,
  type HeliosManualLevel,
} from "../../../../types/ventilation";

const ICON_TINT_CLASSES: Record<
  BackgroundTintLevel,
  { container: string; icon: string }
> = {
  good: {
    container: "bg-emerald-500/30",
    icon: "text-emerald-100",
  },
  moderate: {
    container: "bg-amber-500/30",
    icon: "text-amber-100",
  },
  bad: {
    container: "bg-rose-500/30",
    icon: "text-rose-100",
  },
};

const DEFAULT_ICON_TINT = {
  container: "bg-slate-500/30",
  icon: "text-slate-100",
};

const resolveIconTint = (
  value: number | null,
  property: string
): { container: string; icon: string } => {
  const level = getBackgroundTintLevel(
    value,
    LOCATION_PROPERTY_CONTROL_CONFIGS[property].backgroundTintBands
  );
  if (level === null) {
    return DEFAULT_ICON_TINT;
  }
  return ICON_TINT_CLASSES[level];
};

export const resolveEgTemperatureTint = (value: number | null) =>
  resolveIconTint(value, PROPERTY_TEMPERATURE);
export const resolveEgHumidityTint = (value: number | null) =>
  resolveIconTint(value, PROPERTY_HUMIDITY);
export const resolveEgCo2Tint = (value: number | null) =>
  resolveIconTint(value, PROPERTY_CO2);
export const resolveEgHealthTint = (value: number | null) =>
  resolveIconTint(value, PROPERTY_AIR_QUALITY);

export const formatEgTemperatureValue = (value: number | null): string => {
  if (value === null) {
    return "--,- °C";
  }
  return `${value.toFixed(1).replace(".", ",")} °C`;
};

export const formatEgHumidityValue = (value: number | null): string => {
  if (value === null) {
    return "--%";
  }
  return `${Math.round(value)}%`;
};

export const formatEgCo2Value = (value: number | null): string => {
  if (value === null) {
    return "-- ppm";
  }
  return `${Math.round(value)} ppm`;
};

export const formatEgHealthStatus = (value: number | null): string => {
  if (value === null) {
    return "--";
  }

  return getHealthIndexLabel(value) ?? "--";
};

const formatHeliosLevel = (level: HeliosManualLevel | null): string => {
  if (level === null) {
    return "--";
  }
  return HELIOS_MANUAL_LEVEL_LABELS[level];
};

export const formatVentilationDecorator = (
  manualLevel: HeliosManualLevel | null,
  actualLevel: HeliosManualLevel | null
): string => {
  if (manualLevel === -1) {
    return `Auto (${formatHeliosLevel(actualLevel)})`;
  }

  return `Manual (${formatHeliosLevel(manualLevel)})`;
};

export const formatVentilationBadge = (
  manualLevel: HeliosManualLevel | null,
  actualLevel: HeliosManualLevel | null
): string => {
  if (manualLevel === -1) {
    return `A${actualLevel === null ? "-" : actualLevel}`;
  }
  return `M${manualLevel === null ? "-" : manualLevel}`;
};

