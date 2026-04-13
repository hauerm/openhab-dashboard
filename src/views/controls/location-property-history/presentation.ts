import type { ComponentType } from "react";
import {
  MdBrightness3,
  MdBrightness5,
  MdCloud,
  MdSunny,
  MdWbSunny,
} from "react-icons/md";
import { getHealthIndexLabel } from "../../../domain/air-quality";
import { PROPERTY_ILLUMINANCE } from "../../../domain/openhab-properties";
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

export type IlluminanceVisualState =
  | "night"
  | "dim"
  | "soft"
  | "bright"
  | "sunny";

export interface IlluminancePresentation {
  state: IlluminanceVisualState;
  label: string;
  icon: ComponentType<{ className?: string }>;
  tint: LocationPropertyTint;
}

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

const ILLUMINANCE_PRESENTATIONS: Record<
  IlluminanceVisualState,
  Omit<IlluminancePresentation, "state">
> = {
  night: {
    label: "Night",
    icon: MdBrightness3,
    tint: {
      block: "border-illuminance-night-emphasis bg-illuminance-night-surface",
      iconContainer: "bg-illuminance-night-emphasis",
      icon: "text-illuminance-night-foreground",
    },
  },
  dim: {
    label: "Dim",
    icon: MdBrightness5,
    tint: {
      block: "border-illuminance-dim-emphasis bg-illuminance-dim-surface",
      iconContainer: "bg-illuminance-dim-emphasis",
      icon: "text-illuminance-dim-foreground",
    },
  },
  soft: {
    label: "Soft",
    icon: MdCloud,
    tint: {
      block: "border-illuminance-soft-emphasis bg-illuminance-soft-surface",
      iconContainer: "bg-illuminance-soft-emphasis",
      icon: "text-illuminance-soft-foreground",
    },
  },
  bright: {
    label: "Bright",
    icon: MdWbSunny,
    tint: {
      block: "border-illuminance-bright-emphasis bg-illuminance-bright-surface",
      iconContainer: "bg-illuminance-bright-emphasis",
      icon: "text-illuminance-bright-foreground",
    },
  },
  sunny: {
    label: "Sunny",
    icon: MdSunny,
    tint: {
      block: "border-illuminance-sunny-emphasis bg-illuminance-sunny-surface",
      iconContainer: "bg-illuminance-sunny-emphasis",
      icon: "text-illuminance-sunny-foreground",
    },
  },
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

const formatIlluminanceValue = (value: number | null): string => {
  if (value === null) {
    return "-- lx";
  }

  return `${new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(value)} lx`;
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

export const resolveIlluminanceVisualState = (
  value: number | null
): IlluminanceVisualState | null => {
  if (value === null) {
    return null;
  }

  if (value < 10) {
    return "night";
  }
  if (value < 400) {
    return "dim";
  }
  if (value < 5_000) {
    return "soft";
  }
  if (value < 20_000) {
    return "bright";
  }
  return "sunny";
};

export const resolveIlluminancePresentation = (
  value: number | null
): IlluminancePresentation | null => {
  const state = resolveIlluminanceVisualState(value);
  if (state === null) {
    return null;
  }

  return {
    state,
    ...ILLUMINANCE_PRESENTATIONS[state],
  };
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
    case "illuminance":
      return formatIlluminanceValue(value);
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
  if (property === PROPERTY_ILLUMINANCE) {
    return resolveIlluminancePresentation(value)?.tint ?? DEFAULT_TINT;
  }

  const config = LOCATION_PROPERTY_CONTROL_CONFIGS[property];
  const level = getBackgroundTintLevel(value, config.backgroundTintBands);
  if (level === null) {
    return DEFAULT_TINT;
  }

  return TINT_CLASSES[level];
};
