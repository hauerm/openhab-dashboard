import React from "react";
import {
  MdThermostat,
  MdWaterDrop,
  MdCo2,
  MdHealthAndSafety,
} from "react-icons/md";
import {
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
  PROPERTY_CO2,
  PROPERTY_AIR_QUALITY,
} from "../services/config";
import type { HistoryRangeKey } from "./historyRanges";

export interface LocationPropertyControlConfig {
  property: string;
  defaultHistoryRangeKey: HistoryRangeKey;
  maxHistoryRangeKey?: HistoryRangeKey;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  backgroundTintBands: BackgroundTintBand[];
}

export type BackgroundTintLevel = "good" | "moderate" | "bad";

export interface BackgroundTintBand {
  level: BackgroundTintLevel;
  min?: number;
  max?: number;
}

export const getBackgroundTintLevel = (
  value: number | null,
  bands: BackgroundTintBand[]
): BackgroundTintLevel | null => {
  if (value === null) {
    return null;
  }

  for (const band of bands) {
    const minOk = band.min === undefined || value >= band.min;
    const maxOk = band.max === undefined || value <= band.max;
    if (minOk && maxOk) {
      return band.level;
    }
  }

  return null;
};

export const BACKGROUND_TINT_CLASSES: Record<BackgroundTintLevel, string> = {
  good: "bg-gradient-to-t from-green-500/35 to-transparent",
  moderate: "bg-gradient-to-t from-orange-500/35 to-transparent",
  bad: "bg-gradient-to-t from-red-500/35 to-transparent",
};

export const LOCATION_PROPERTY_CONTROL_CONFIGS: Record<string, LocationPropertyControlConfig> = {
  [PROPERTY_TEMPERATURE]: {
    property: PROPERTY_TEMPERATURE,
    defaultHistoryRangeKey: "day",
    maxHistoryRangeKey: "year",
    unit: "°C",
    icon: MdThermostat,
    title: "Temperature",
    backgroundTintBands: [
      { level: "moderate", max: 20 },
      { level: "good", min: 20, max: 24 },
      { level: "moderate", min: 24, max: 27 },
      { level: "bad", min: 27 },
    ],
  },
  [PROPERTY_HUMIDITY]: {
    property: PROPERTY_HUMIDITY,
    defaultHistoryRangeKey: "day",
    maxHistoryRangeKey: "year",
    unit: "%",
    icon: MdWaterDrop,
    title: "Humidity",
    backgroundTintBands: [
      { level: "moderate", max: 30 },
      { level: "good", min: 30, max: 60 },
      { level: "moderate", min: 60, max: 70 },
      { level: "bad", min: 70 },
    ],
  },
  [PROPERTY_CO2]: {
    property: PROPERTY_CO2,
    defaultHistoryRangeKey: "day",
    maxHistoryRangeKey: "year",
    unit: "ppm",
    icon: MdCo2,
    title: "CO₂",
    backgroundTintBands: [
      { level: "good", max: 800 },
      { level: "moderate", min: 800, max: 1400 },
      { level: "bad", min: 1400 },
    ],
  },
  [PROPERTY_AIR_QUALITY]: {
    property: PROPERTY_AIR_QUALITY,
    defaultHistoryRangeKey: "day",
    maxHistoryRangeKey: "year",
    unit: "",
    icon: MdHealthAndSafety,
    title: "Air Quality",
    // AQI Health Index: 0 healthy, 1 fine, 2 fair, 3 poor, 4 unhealthy
    // Bands use rounding boundaries so tint matches displayed mapped label.
    backgroundTintBands: [
      { level: "good", max: 1.49 },
      { level: "moderate", min: 1.5, max: 2.49 },
      { level: "bad", min: 2.5 },
    ],
  },
};
