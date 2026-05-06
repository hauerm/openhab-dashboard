import type { ComponentType } from "react";
import {
  MdBrightness3,
  MdBrightness5,
  MdCloud,
  MdSunny,
  MdWbSunny,
} from "react-icons/md";
import { getHealthIndexLabel } from "../../../domain/air-quality";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_RAIN,
  PROPERTY_TEMPERATURE,
} from "../../../domain/openhab-properties";
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
    block: "border-scale-risk-good-emphasis bg-scale-risk-good-surface",
    iconContainer: "bg-scale-risk-good-emphasis",
    icon: "text-scale-risk-good-foreground",
  },
  moderate: {
    block: "border-scale-risk-moderate-emphasis bg-scale-risk-moderate-surface",
    iconContainer: "bg-scale-risk-moderate-emphasis",
    icon: "text-scale-risk-moderate-foreground",
  },
  bad: {
    block: "border-scale-risk-bad-emphasis bg-scale-risk-bad-surface",
    iconContainer: "bg-scale-risk-bad-emphasis",
    icon: "text-scale-risk-bad-foreground",
  },
};

const TEMPERATURE_TINT_CLASSES = {
  cold: {
    block: "border-scale-temp-cold-emphasis bg-scale-temp-cold-surface",
    iconContainer: "bg-scale-temp-cold-emphasis",
    icon: "text-scale-temp-cold-foreground",
  },
  comfort: {
    block: "border-scale-temp-comfort-emphasis bg-scale-temp-comfort-surface",
    iconContainer: "bg-scale-temp-comfort-emphasis",
    icon: "text-scale-temp-comfort-foreground",
  },
  warm: {
    block: "border-scale-temp-warm-emphasis bg-scale-temp-warm-surface",
    iconContainer: "bg-scale-temp-warm-emphasis",
    icon: "text-scale-temp-warm-foreground",
  },
  hot: {
    block: "border-scale-temp-hot-emphasis bg-scale-temp-hot-surface",
    iconContainer: "bg-scale-temp-hot-emphasis",
    icon: "text-scale-temp-hot-foreground",
  },
} satisfies Record<string, LocationPropertyTint>;

const HUMIDITY_TINT_CLASSES = {
  dry: {
    block: "border-scale-humidity-dry-emphasis bg-scale-humidity-dry-surface",
    iconContainer: "bg-scale-humidity-dry-emphasis",
    icon: "text-scale-humidity-dry-foreground",
  },
  comfort: {
    block:
      "border-scale-humidity-comfort-emphasis bg-scale-humidity-comfort-surface",
    iconContainer: "bg-scale-humidity-comfort-emphasis",
    icon: "text-scale-humidity-comfort-foreground",
  },
  humid: {
    block: "border-scale-humidity-humid-emphasis bg-scale-humidity-humid-surface",
    iconContainer: "bg-scale-humidity-humid-emphasis",
    icon: "text-scale-humidity-humid-foreground",
  },
  wet: {
    block: "border-scale-humidity-wet-emphasis bg-scale-humidity-wet-surface",
    iconContainer: "bg-scale-humidity-wet-emphasis",
    icon: "text-scale-humidity-wet-foreground",
  },
} satisfies Record<string, LocationPropertyTint>;

const DEFAULT_TINT: LocationPropertyTint = {
  block: "border-status-neutral-emphasis bg-status-neutral-surface",
  iconContainer: "bg-status-neutral-surface",
  icon: "text-status-neutral-foreground",
};

const RAIN_ACTIVE_TINT: LocationPropertyTint = {
  block: "border-rain-active-emphasis bg-rain-active-surface",
  iconContainer: "bg-rain-active-emphasis",
  icon: "text-rain-active-foreground",
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

const formatWindValue = (value: number | null): string => {
  if (value === null) {
    return "-- km/h";
  }

  return `${value.toFixed(1).replace(".", ",")} km/h`;
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

const resolveTemperatureTint = (value: number | null): LocationPropertyTint => {
  if (value === null) {
    return DEFAULT_TINT;
  }
  if (value <= 20) {
    return TEMPERATURE_TINT_CLASSES.cold;
  }
  if (value <= 24) {
    return TEMPERATURE_TINT_CLASSES.comfort;
  }
  if (value <= 27) {
    return TEMPERATURE_TINT_CLASSES.warm;
  }
  return TEMPERATURE_TINT_CLASSES.hot;
};

const resolveHumidityTint = (value: number | null): LocationPropertyTint => {
  if (value === null) {
    return DEFAULT_TINT;
  }
  if (value <= 30) {
    return HUMIDITY_TINT_CLASSES.dry;
  }
  if (value <= 60) {
    return HUMIDITY_TINT_CLASSES.comfort;
  }
  if (value <= 70) {
    return HUMIDITY_TINT_CLASSES.humid;
  }
  return HUMIDITY_TINT_CLASSES.wet;
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
    case "rain":
      return "";
    case "wind":
      return formatWindValue(value);
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
  if (property === PROPERTY_TEMPERATURE) {
    return resolveTemperatureTint(value);
  }

  if (property === PROPERTY_HUMIDITY) {
    return resolveHumidityTint(value);
  }

  if (property === PROPERTY_ILLUMINANCE) {
    return resolveIlluminancePresentation(value)?.tint ?? DEFAULT_TINT;
  }

  if (property === PROPERTY_RAIN) {
    return value !== null && value > 0 ? RAIN_ACTIVE_TINT : DEFAULT_TINT;
  }

  if (property !== PROPERTY_CO2 && property !== PROPERTY_AIR_QUALITY) {
    return DEFAULT_TINT;
  }

  const config = LOCATION_PROPERTY_CONTROL_CONFIGS[property];
  const level = getBackgroundTintLevel(value, config.backgroundTintBands);
  if (level === null) {
    return DEFAULT_TINT;
  }

  return TINT_CLASSES[level];
};
