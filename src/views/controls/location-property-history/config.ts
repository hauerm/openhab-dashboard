import type { ComponentType } from "react";
import {
  MdAir,
  MdCo2,
  MdHealthAndSafety,
  MdLightMode,
  MdThermostat,
  MdWaterDrop,
} from "react-icons/md";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_RAIN,
  PROPERTY_TEMPERATURE,
  PROPERTY_WIND,
} from "../../../domain/openhab-properties";

export type HistoryRangeKey = "year" | "month" | "week" | "day" | "8h" | "4h" | "2h";

export interface HistoryRangeOption {
  key: HistoryRangeKey;
  label: string;
  durationMs: number;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const HISTORY_RANGE_OPTIONS: HistoryRangeOption[] = [
  { key: "year", label: "Jahr", durationMs: 365 * DAY_MS },
  { key: "month", label: "Monat", durationMs: 30 * DAY_MS },
  { key: "week", label: "Woche", durationMs: 7 * DAY_MS },
  { key: "day", label: "Tag", durationMs: DAY_MS },
  { key: "8h", label: "8h", durationMs: 8 * HOUR_MS },
  { key: "4h", label: "4h", durationMs: 4 * HOUR_MS },
  { key: "2h", label: "2h", durationMs: 2 * HOUR_MS },
];

const RANGE_DURATION_BY_KEY: Record<HistoryRangeKey, number> =
  HISTORY_RANGE_OPTIONS.reduce((acc, option) => {
    acc[option.key] = option.durationMs;
    return acc;
  }, {} as Record<HistoryRangeKey, number>);

export const getHistoryRangeDurationMs = (key: HistoryRangeKey): number =>
  RANGE_DURATION_BY_KEY[key];

export interface LocationPropertyControlConfig {
  property: string;
  defaultHistoryRangeKey: HistoryRangeKey;
  maxHistoryRangeKey?: HistoryRangeKey;
  unit: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  backgroundTintBands: BackgroundTintBand[];
  parseState?: (rawValue: string) => number | null;
  isVisibleInSidebar?: (value: number | null) => boolean;
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

export const parseRainState = (rawValue: string): number | null => {
  const normalized = rawValue.trim().toUpperCase();

  if (normalized === "ON") {
    return 1;
  }
  if (normalized === "OFF") {
    return 0;
  }
  if (normalized === "UNDEF" || normalized === "NULL" || normalized === "-") {
    return null;
  }

  const numericValue = Number.parseFloat(normalized);
  if (Number.isFinite(numericValue)) {
    return numericValue > 0 ? 1 : 0;
  }

  return null;
};

export const LOCATION_PROPERTY_CONTROL_CONFIGS: Record<
  string,
  LocationPropertyControlConfig
> = {
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
  [PROPERTY_ILLUMINANCE]: {
    property: PROPERTY_ILLUMINANCE,
    defaultHistoryRangeKey: "day",
    maxHistoryRangeKey: "year",
    unit: "lx",
    icon: MdLightMode,
    title: "Illuminance",
    backgroundTintBands: [],
  },
  [PROPERTY_RAIN]: {
    property: PROPERTY_RAIN,
    defaultHistoryRangeKey: "day",
    maxHistoryRangeKey: "year",
    unit: "",
    icon: MdWaterDrop,
    title: "Rain",
    backgroundTintBands: [],
    parseState: parseRainState,
    isVisibleInSidebar: (value) => value !== null && value > 0,
  },
  [PROPERTY_WIND]: {
    property: PROPERTY_WIND,
    defaultHistoryRangeKey: "day",
    maxHistoryRangeKey: "year",
    unit: "km/h",
    icon: MdAir,
    title: "Wind",
    backgroundTintBands: [],
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
    backgroundTintBands: [
      { level: "good", max: 1.49 },
      { level: "moderate", min: 1.5, max: 2.49 },
      { level: "bad", min: 2.5 },
    ],
  },
};
