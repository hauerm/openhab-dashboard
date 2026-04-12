import { getHealthIndexLabel } from "../../../domain/air-quality";
import {
  getBackgroundTintLevel,
  LOCATION_PROPERTY_CONTROL_CONFIGS,
  type BackgroundTintLevel,
} from "./config";
import type { LocationPropertyHistoryControlDefinition } from "../controlDefinitions";

export type LocationPropertyTint = {
  block: string;
  iconContainer: string;
  icon: string;
};

const TINT_CLASSES: Record<BackgroundTintLevel, LocationPropertyTint> = {
  good: {
    block: "border-status-good-emphasis bg-status-good-surface",
    iconContainer: "bg-status-good-emphasis",
    icon: "text-status-good-foreground",
  },
  moderate: {
    block: "border-status-moderate-emphasis bg-status-moderate-surface",
    iconContainer: "bg-status-moderate-emphasis",
    icon: "text-status-moderate-foreground",
  },
  bad: {
    block: "border-status-critical-emphasis bg-status-critical-surface",
    iconContainer: "bg-status-critical-emphasis",
    icon: "text-status-critical-foreground",
  },
};

const DEFAULT_TINT: LocationPropertyTint = {
  block: "border-ui-border-subtle bg-ui-surface-panel",
  iconContainer: "bg-status-neutral-surface",
  icon: "text-status-neutral-foreground",
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
): LocationPropertyTint => {
  const config = LOCATION_PROPERTY_CONTROL_CONFIGS[property];
  const level = getBackgroundTintLevel(value, config.backgroundTintBands);
  if (level === null) {
    return DEFAULT_TINT;
  }

  return TINT_CLASSES[level];
};
