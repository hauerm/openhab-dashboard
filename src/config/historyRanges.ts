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
