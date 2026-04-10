import React from "react";
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
import { LOCATION_PROPERTY_CONTROL_CONFIGS } from "../../../config/locationPropertyControlTypes";
import { createLocationPropertyHistoryStore } from "../../../stores/locationPropertyHistoryStore";
import { PROPERTY_TEMPERATURE } from "../../../services/config";
import {
  HISTORY_RANGE_OPTIONS,
  getHistoryRangeDurationMs,
  type HistoryRangeKey,
} from "../../../config/historyRanges";

interface LocationPropertyHistoryControlProps {
  property: string;
  location?: string;
  title: string;
  unit?: string;
  defaultRangeKey?: HistoryRangeKey;
  showAverageLine?: boolean;
  comfortBand?: {
    min: number;
    max: number;
    label?: string;
  };
  className?: string;
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

const SERIES_COLORS = [
  "#38BDF8",
  "#34D399",
  "#F59E0B",
  "#F97316",
  "#F43F5E",
  "#14B8A6",
];

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

const LocationPropertyHistoryControl: React.FC<LocationPropertyHistoryControlProps> = ({
  property,
  location,
  title,
  unit,
  defaultRangeKey,
  showAverageLine = true,
  comfortBand,
  className = "",
}) => {
  const resolvedConfig =
    LOCATION_PROPERTY_CONTROL_CONFIGS[property] ?? LOCATION_PROPERTY_CONTROL_CONFIGS[PROPERTY_TEMPERATURE];
  const resolvedUnit = unit ?? resolvedConfig.unit;
  const initialRangeKey = defaultRangeKey ?? resolvedConfig.defaultHistoryRangeKey;
  const [activeRangeKey, setActiveRangeKey] =
    React.useState<HistoryRangeKey>(initialRangeKey);
  const scopeKey = location?.trim() || "__all__";

  const useStore = React.useMemo(
    () => createLocationPropertyHistoryStore(resolvedConfig, scopeKey),
    [resolvedConfig, scopeKey]
  );

  const initialize = useStore((state) => state.initialize);
  const ensureHistoryRange = useStore((state) => state.ensureHistoryRange);
  const history = useStore((state) => state.history);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const itemCount = useStore((state) => state.itemNames.size);

  React.useEffect(() => {
    void initialize(location);
  }, [initialize, location]);

  React.useEffect(() => {
    if (itemCount === 0) {
      return;
    }
    void ensureHistoryRange(activeRangeKey);
  }, [activeRangeKey, ensureHistoryRange, itemCount]);

  const filteredHistory = React.useMemo(() => {
    const cutoff = Date.now() - getHistoryRangeDurationMs(activeRangeKey);
    const nextHistory: Record<string, HistoryPoint[]> = {};

    for (const [itemName, points] of Object.entries(history)) {
      const inWindow = points.filter((point) => point.timestamp >= cutoff);
      if (inWindow.length > 0) {
        nextHistory[itemName] = inWindow;
      } else if (points.length > 0) {
        nextHistory[itemName] = [points[points.length - 1]];
      } else {
        nextHistory[itemName] = [];
      }
    }

    return nextHistory;
  }, [activeRangeKey, history]);

  const seriesKeys = React.useMemo(
    () =>
      Object.entries(filteredHistory)
        .filter(([, points]) => points.length > 0)
        .map(([itemName]) => itemName)
        .sort(),
    [filteredHistory]
  );

  const chartData = React.useMemo(() => {
    const rowsByTimestamp = new Map<number, Record<string, number>>();

    for (const [itemName, points] of Object.entries(filteredHistory)) {
      for (const point of points) {
        const row = rowsByTimestamp.get(point.timestamp) ?? {};
        row[itemName] = point.value;
        rowsByTimestamp.set(point.timestamp, row);
      }
    }

    return Array.from(rowsByTimestamp.entries())
      .sort(([a], [b]) => a - b)
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

  const yDomain = React.useMemo(() => {
    const values: number[] = [];

    for (const row of chartData) {
      for (const key of seriesKeys) {
        const value = row[key];
        if (typeof value === "number" && Number.isFinite(value)) {
          values.push(value);
        }
      }

      if (
        showAverageLine &&
        typeof row.average === "number" &&
        Number.isFinite(row.average)
      ) {
        values.push(row.average);
      }
    }

    if (comfortBand) {
      values.push(comfortBand.min, comfortBand.max);
    }

    if (values.length === 0) {
      return [0, 1] as [number, number];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    const padding = Math.max(spread * 0.12, 0.4);

    return [min - padding, max + padding] as [number, number];
  }, [chartData, comfortBand, seriesKeys, showAverageLine]);

  const axisTimeFormatter = React.useMemo(
    () => buildAxisTimeFormatter(activeRangeKey),
    [activeRangeKey]
  );

  const hasData = chartData.length > 0;
  const yAxisLabel = resolvedUnit ? `Wert (${resolvedUnit})` : "Wert";

  return (
    <section
      data-testid="location-property-history-control-overlay"
      className={`flex h-full min-h-0 w-full flex-col rounded-3xl border border-white/20 bg-slate-900/35 p-4 shadow-2xl backdrop-blur-2xl md:p-6 ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 text-white">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
          <div className="mt-1 text-xs text-white/75 md:text-sm">
            {location ? `Standort: ${location}` : "Alle Standorte"}
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
            {loading && (
              <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md border border-white/20 bg-slate-900/70 px-2 py-1 text-xs text-white/75 backdrop-blur">
                Lade...
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 16, right: 32, left: 8, bottom: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.16)"
                />
                {comfortBand && (
                  <ReferenceArea
                    y1={comfortBand.min}
                    y2={comfortBand.max}
                    fill="#22C55E"
                    fillOpacity={0.12}
                    ifOverflow="extendDomain"
                  />
                )}
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
                  tickFormatter={(value) => Number(value).toFixed(1)}
                  tick={{ fill: "rgba(255, 255, 255, 0.82)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.32)" }}
                  tickLine={{ stroke: "rgba(255, 255, 255, 0.32)" }}
                  width={54}
                  label={{
                    value: yAxisLabel,
                    angle: -90,
                    offset: -2,
                    position: "insideLeft",
                    fill: "rgba(255, 255, 255, 0.82)",
                  }}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255, 255, 255, 0.30)", strokeWidth: 1 }}
                  labelFormatter={(label) =>
                    tooltipTimeFormatter.format(new Date(Number(label)))
                  }
                  formatter={(value, name) => {
                    if (typeof value !== "number" || !Number.isFinite(value)) {
                      return ["--", name === "average" ? "Mittelwert" : name];
                    }
                    return [
                      `${value.toFixed(1)}${resolvedUnit ? ` ${resolvedUnit}` : ""}`,
                      name === "average" ? "Mittelwert" : name,
                    ];
                  }}
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.88)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    borderRadius: "0.8rem",
                    backdropFilter: "blur(8px)",
                  }}
                  labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend
                  formatter={(value) =>
                    value === "average" ? "Mittelwert" : String(value)
                  }
                  wrapperStyle={{ color: "rgba(248, 250, 252, 0.9)" }}
                />

                {seriesKeys.map((itemName, index) => (
                  <Line
                    key={itemName}
                    type="monotone"
                    dataKey={itemName}
                    name={itemName}
                    stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}

                {showAverageLine && (
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="average"
                    stroke="#F8FAFC"
                    strokeWidth={3}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {comfortBand?.label && (
        <div className="mt-3 text-xs text-white/70">
          Referenzbereich: {comfortBand.label} ({comfortBand.min.toFixed(1)}-
          {comfortBand.max.toFixed(1)}
          {resolvedUnit ? ` ${resolvedUnit}` : ""})
        </div>
      )}
    </section>
  );
};

export default LocationPropertyHistoryControl;
