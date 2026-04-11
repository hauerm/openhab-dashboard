import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HISTORY_RANGE_OPTIONS,
  getHistoryRangeDurationMs,
  type HistoryRangeKey,
} from "../../../../config/historyRanges";
import { LOCATION_PROPERTY_CONTROL_CONFIGS } from "../../../../config/locationPropertyControlTypes";
import SceneOverlayShell from "../../SceneOverlayShell";
import type { LocationPropertyHistoryControlDefinition } from "../controlDefinitions";
import {
  useLocationPropertyHistoryControlModel,
  useLocationPropertyHistoryControlStore,
} from "./model";

interface LocationPropertyHistoryHudControlProps {
  definition: LocationPropertyHistoryControlDefinition;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface LocationPropertyHistoryOverlayControlProps {
  definition: LocationPropertyHistoryControlDefinition;
  onClose: () => void;
}

type HistoryPoint = {
  timestamp: number;
  value: number;
};

type ChartRow = {
  timestamp: number;
  average: number | null;
  [series: string]: number | null;
};

const TEST_ID_SUFFIX_BY_METRIC_KEY = {
  temperature: "temp",
  humidity: "humidity",
  co2: "co2",
  "air-quality": "health",
} as const;

const SERIES_COLORS = [
  "#38BDF8",
  "#34D399",
  "#F59E0B",
  "#F97316",
  "#F43F5E",
  "#14B8A6",
] as const;

const buildAxisTimeFormatter = (rangeKey: HistoryRangeKey) => {
  if (rangeKey === "year" || rangeKey === "month") {
    return new Intl.DateTimeFormat(undefined, {
      month: "2-digit",
      day: "2-digit",
    });
  }

  if (rangeKey === "week") {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
    });
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const tooltipTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const LocationPropertyHistoryHudControl = ({
  definition,
  interactive = true,
  onOpenControl,
}: LocationPropertyHistoryHudControlProps) => {
  const { icon: Icon, value, tint } = useLocationPropertyHistoryControlModel(definition);
  const textShadowClass = "[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]";

  return (
    <button
      type="button"
      data-testid={`hud-metric-${TEST_ID_SUFFIX_BY_METRIC_KEY[definition.metricKey]}`}
      onClick={() => {
        if (!interactive) {
          return;
        }
        onOpenControl(definition.controlId);
      }}
      className="group flex items-center gap-3 rounded-xl px-1 py-1 text-left"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${tint.container} ${tint.icon}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-white">
        <span
          className={`block font-semibold leading-none ${
            definition.metricKey === "air-quality"
              ? "text-2xl md:text-3xl"
              : "text-3xl md:text-4xl"
          } ${textShadowClass}`}
        >
          {value}
        </span>
        <span className={`block text-sm text-white/80 ${textShadowClass}`}>
          {definition.label}
        </span>
      </span>
    </button>
  );
};

export const LocationPropertyHistoryOverlayControl = ({
  definition,
  onClose,
}: LocationPropertyHistoryOverlayControlProps) => {
  const resolvedConfig = LOCATION_PROPERTY_CONTROL_CONFIGS[definition.property];
  const resolvedUnit = resolvedConfig.unit;
  const initialRangeKey = resolvedConfig.defaultHistoryRangeKey;
  const [activeRangeKey, setActiveRangeKey] =
    useState<HistoryRangeKey>(initialRangeKey);
  const useStore = useLocationPropertyHistoryControlStore(definition);
  const ensureHistoryRange = useStore((state) => state.ensureHistoryRange);
  const history = useStore((state) => state.history);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const itemCount = useStore((state) => state.itemNames.size);

  useEffect(() => {
    if (itemCount === 0) {
      return;
    }
    void ensureHistoryRange(activeRangeKey);
  }, [activeRangeKey, ensureHistoryRange, itemCount]);

  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - getHistoryRangeDurationMs(activeRangeKey);
    const nextHistory: Record<string, HistoryPoint[]> = {};

    for (const [itemName, points] of Object.entries(history)) {
      const inWindow = points.filter((point) => point.timestamp >= cutoff);
      nextHistory[itemName] =
        inWindow.length > 0
          ? inWindow
          : points.length > 0
          ? [points[points.length - 1]]
          : [];
    }

    return nextHistory;
  }, [activeRangeKey, history]);

  const seriesKeys = useMemo(
    () =>
      Object.entries(filteredHistory)
        .filter(([, points]) => points.length > 0)
        .map(([itemName]) => itemName)
        .sort(),
    [filteredHistory]
  );

  const chartData = useMemo(() => {
    const rowsByTimestamp = new Map<number, Record<string, number>>();

    for (const [itemName, points] of Object.entries(filteredHistory)) {
      for (const point of points) {
        const row = rowsByTimestamp.get(point.timestamp) ?? {};
        row[itemName] = point.value;
        rowsByTimestamp.set(point.timestamp, row);
      }
    }

    return Array.from(rowsByTimestamp.entries())
      .sort(([left], [right]) => left - right)
      .map(([timestamp, valuesBySeries]) => {
        let sum = 0;
        let count = 0;
        const row: ChartRow = {
          timestamp,
          average: null,
        };

        for (const key of seriesKeys) {
          const value = valuesBySeries[key];
          if (typeof value === "number" && Number.isFinite(value)) {
            row[key] = value;
            sum += value;
            count += 1;
          } else {
            row[key] = null;
          }
        }

        row.average = count > 0 ? sum / count : null;
        return row;
      });
  }, [filteredHistory, seriesKeys]);

  const yDomain = useMemo(() => {
    const values: number[] = [];

    for (const row of chartData) {
      for (const key of seriesKeys) {
        const value = row[key];
        if (typeof value === "number" && Number.isFinite(value)) {
          values.push(value);
        }
      }

      if (typeof row.average === "number" && Number.isFinite(row.average)) {
        values.push(row.average);
      }
    }

    if (definition.comfortBand) {
      values.push(definition.comfortBand.min, definition.comfortBand.max);
    }

    if (values.length === 0) {
      return [0, 1] as [number, number];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    const padding = Math.max(spread * 0.12, 0.4);

    return [min - padding, max + padding] as [number, number];
  }, [chartData, definition.comfortBand, seriesKeys]);

  const axisTimeFormatter = useMemo(
    () => buildAxisTimeFormatter(activeRangeKey),
    [activeRangeKey]
  );

  const hasData = chartData.length > 0;
  const yAxisLabel = resolvedUnit ? `Wert (${resolvedUnit})` : "Wert";

  return (
    <SceneOverlayShell onClose={onClose} layout="fullscreen">
      <section
        data-testid="location-property-history-control-overlay"
        className="flex h-full min-h-0 w-full flex-col rounded-3xl border border-white/20 bg-slate-900/35 p-4 shadow-2xl backdrop-blur-2xl md:p-6"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 text-white">
          <div>
            <h2 className="text-xl font-semibold md:text-2xl">{definition.title}</h2>
            <div className="mt-1 text-xs text-white/75 md:text-sm">
              {definition.location
                ? `Standort: ${definition.location}`
                : "Alle Standorte"}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-1.5">
            {HISTORY_RANGE_OPTIONS.map((option) => {
              const isActive = option.key === activeRangeKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActiveRangeKey(option.key)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition md:text-sm ${
                    isActive
                      ? "border-white/65 bg-white/20 text-white"
                      : "border-white/20 bg-black/20 text-white/75 hover:border-white/40 hover:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="mt-4 min-h-0 flex-1">
          {!hasData && loading ? (
            <div className="flex h-full items-center justify-center text-white/70">
              Lade Historie...
            </div>
          ) : error && !hasData ? (
            <div className="flex h-full items-center justify-center text-red-300">
              {error}
            </div>
          ) : !hasData ? (
            <div className="flex h-full items-center justify-center text-white/70">
              Keine historischen Werte im gewählten Zeitraum verfügbar.
            </div>
          ) : (
            <div className="relative h-full w-full">
              {loading ? (
                <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md border border-white/20 bg-slate-900/70 px-2 py-1 text-xs text-white/75 backdrop-blur">
                  Lade...
                </div>
              ) : null}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 16, right: 32, left: 8, bottom: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.16)"
                  />
                  {definition.comfortBand ? (
                    <ReferenceArea
                      y1={definition.comfortBand.min}
                      y2={definition.comfortBand.max}
                      fill="#22C55E"
                      fillOpacity={0.12}
                      ifOverflow="extendDomain"
                    />
                  ) : null}
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(value) =>
                      axisTimeFormatter.format(new Date(Number(value)))
                    }
                    tick={{ fill: "rgba(255, 255, 255, 0.82)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.32)" }}
                    tickLine={{ stroke: "rgba(255, 255, 255, 0.32)" }}
                    minTickGap={24}
                  />
                  <YAxis
                    type="number"
                    domain={yDomain}
                    tick={{ fill: "rgba(255, 255, 255, 0.82)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.32)" }}
                    tickLine={{ stroke: "rgba(255, 255, 255, 0.32)" }}
                    width={72}
                    label={{
                      value: yAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: "rgba(255, 255, 255, 0.72)",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const label = typeof name === "string" ? name : String(name ?? "");
                      if (typeof value !== "number" || !Number.isFinite(value)) {
                        return ["--", label];
                      }
                      const suffix = resolvedUnit ? ` ${resolvedUnit}` : "";
                      return [`${value.toFixed(1)}${suffix}`, label];
                    }}
                    labelFormatter={(value) =>
                      tooltipTimeFormatter.format(new Date(Number(value)))
                    }
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.92)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                      borderRadius: "12px",
                      color: "white",
                    }}
                    itemStyle={{ color: "white" }}
                    labelStyle={{ color: "rgba(255, 255, 255, 0.75)" }}
                  />
                  <Legend
                    wrapperStyle={{
                      color: "white",
                      paddingTop: 8,
                    }}
                  />
                  {seriesKeys.map((seriesKey, index) => (
                    <Line
                      key={seriesKey}
                      type="monotone"
                      dataKey={seriesKey}
                      name={seriesKey}
                      stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Durchschnitt"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </SceneOverlayShell>
  );
};
