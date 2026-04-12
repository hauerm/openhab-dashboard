import { getHealthIndexLabel } from "../../../../domain/air-quality";
import {
  getBackgroundTintLevel,
  LOCATION_PROPERTY_CONTROL_CONFIGS,
  type BackgroundTintLevel,
} from "./config";
import type { LocationPropertyHistoryControlDefinition } from "../controlDefinitions";

type IconTint = {
  container: string;
  icon: string;
};

const ICON_TINT_CLASSES: Record<BackgroundTintLevel, IconTint> = {
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

const DEFAULT_ICON_TINT: IconTint = {
  container: "bg-slate-500/30",
  icon: "text-slate-100",
};

const formatTemperatureValue = (value: number | null): string => {
  if (value === null) {
    return "--,- °C";
  }

  return `${value.toFixed(1).replace(".", ",")} °C`;
};

const formatHumidityValue = (value: number | null): string => {
  if (value === null) {
    return "--%";
  }

  return `${Math.round(value)}%`;
};

const formatCo2Value = (value: number | null): string => {
  if (value === null) {
    return "-- ppm";
  }

  return `${Math.round(value)} ppm`;
};

const formatHealthStatus = (value: number | null): string => {
  if (value === null) {
    return "--";
  }

  return getHealthIndexLabel(value) ?? "--";
};

export const formatLocationPropertyValue = (
  metricKey: LocationPropertyHistoryControlDefinition["metricKey"],
  value: number | null
): string => {
  switch (metricKey) {
    case "temperature":
      return formatTemperatureValue(value);
    case "humidity":
      return formatHumidityValue(value);
    case "co2":
      return formatCo2Value(value);
    case "air-quality":
      return formatHealthStatus(value);
  }
};

export const resolveLocationPropertyTint = (
  property: string,
  value: number | null
): IconTint => {
  const config = LOCATION_PROPERTY_CONTROL_CONFIGS[property];
  const level = getBackgroundTintLevel(value, config.backgroundTintBands);
  if (level === null) {
    return DEFAULT_ICON_TINT;
  }

  return ICON_TINT_CLASSES[level];
};
