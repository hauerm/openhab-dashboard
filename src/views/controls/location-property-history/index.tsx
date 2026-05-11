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
} from "./config";
import {
  buildLocationPropertyHistoryChartData,
  shouldShowAverageSeries,
  type HistoryPoint,
} from "./chartData";
import { LOCATION_PROPERTY_CONTROL_CONFIGS } from "./config";
import ViewOverlayShell from "../../ViewOverlayShell";
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

const TEST_ID_SUFFIX_BY_METRIC_KEY = {
  temperature: "temp",
  humidity: "humidity",
  illuminance: "illuminance",
  rain: "rain",
  wind: "wind",
  co2: "co2",
  "air-quality": "health",
} as const;

const SERIES_COLORS = [
  "var(--color-chart-series-1)",
  "var(--color-chart-series-2)",
  "var(--color-chart-series-3)",
  "var(--color-chart-series-4)",
  "var(--color-chart-series-5)",
  "var(--color-chart-series-6)",
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
  const { hasItems, icon: Icon, value, tint } =
    useLocationPropertyHistoryControlModel(definition);
  const textShadowClass = "[text-shadow:0_2px_8px_var(--color-ui-shadow-text)]";

  if (!hasItems) {
    return null;
  }

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
      className="group flex items-center gap-3 rounded-xl px-1 py-1 text-left text-ui-foreground"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${tint.iconContainer} ${tint.icon}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-ui-foreground">
        <span
          className={`block font-semibold leading-none ${
            definition.metricKey === "air-quality"
              ? "text-2xl md:text-3xl"
              : "text-3xl md:text-4xl"
          } ${textShadowClass}`}
        >
          {value}
        </span>
        <span className={`block text-sm text-ui-foreground-muted ${textShadowClass}`}>
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
    return buildLocationPropertyHistoryChartData(filteredHistory, seriesKeys);
  }, [filteredHistory, seriesKeys]);
  const showAverageSeries = shouldShowAverageSeries(seriesKeys);

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
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <section
        data-testid="location-property-history-control-overlay"
        className="pointer-events-none flex h-full min-h-0 w-full flex-col overflow-hidden rounded-none border border-ui-border-subtle bg-ui-surface-panel p-3 pt-16 shadow-2xl backdrop-blur-2xl md:rounded-3xl md:p-6"
      >
        <header className="shrink-0 text-ui-foreground md:flex md:flex-wrap md:items-start md:justify-between md:gap-3">
          <div>
            <h2 className="text-xl font-semibold md:text-2xl">{definition.title}</h2>
            <div className="mt-1 text-xs text-ui-foreground-muted md:text-sm">
              {definition.location
                ? `Standort: ${definition.location}`
                : "Alle Standorte"}
            </div>
          </div>

          <div className="mt-3 flex max-w-full gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] md:mt-0 md:flex-wrap md:justify-end md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {HISTORY_RANGE_OPTIONS.map((option) => {
              const isActive = option.key === activeRangeKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActiveRangeKey(option.key)}
                  className={`pointer-events-auto rounded-md border px-2.5 py-1 text-xs font-medium transition md:text-sm ${
                    isActive
                      ? "border-ui-border-strong bg-ui-surface-muted text-ui-foreground"
                      : "border-ui-border-subtle bg-ui-surface-overlay text-ui-foreground-muted hover:border-ui-border-strong hover:text-ui-foreground"
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
            <div className="flex h-full items-center justify-center text-ui-foreground-muted">
              Lade Historie...
            </div>
          ) : error && !hasData ? (
            <div className="flex h-full items-center justify-center text-status-critical-foreground">
              {error}
            </div>
          ) : !hasData ? (
            <div className="flex h-full items-center justify-center text-ui-foreground-muted">
              Keine historischen Werte im gewählten Zeitraum verfügbar.
            </div>
          ) : (
            <div
              data-testid="location-property-history-chart-scroll"
              className="pointer-events-auto h-full min-h-0 overflow-x-auto overflow-y-hidden md:overflow-visible"
            >
              <div
                data-testid="location-property-history-chart-inner"
                className="relative h-full min-h-0 min-w-[44rem] md:w-full md:min-w-0"
              >
                {loading ? (
                  <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md border border-ui-border-subtle bg-ui-surface-overlay px-2 py-1 text-xs text-ui-foreground-muted backdrop-blur">
                    Lade...
                  </div>
                ) : null}
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 16, right: 32, left: 8, bottom: 16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-chart-grid)"
                    />
                    {definition.comfortBand ? (
                      <ReferenceArea
                        y1={definition.comfortBand.min}
                        y2={definition.comfortBand.max}
                        fill="var(--color-chart-reference-band)"
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
                      tick={{ fill: "var(--color-chart-axis)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--color-chart-axis)" }}
                      tickLine={{ stroke: "var(--color-chart-axis)" }}
                      minTickGap={24}
                    />
                    <YAxis
                      type="number"
                      domain={yDomain}
                      tick={{ fill: "var(--color-chart-axis)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--color-chart-axis)" }}
                      tickLine={{ stroke: "var(--color-chart-axis)" }}
                      width={72}
                      label={{
                        value: yAxisLabel,
                        angle: -90,
                        position: "insideLeft",
                        fill: "var(--color-chart-axis)",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const label =
                          typeof name === "string" ? name : String(name ?? "");
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
                        backgroundColor: "var(--color-chart-tooltip-bg)",
                        border: "1px solid var(--color-chart-tooltip-border)",
                        borderRadius: "12px",
                        color: "var(--color-ui-foreground)",
                      }}
                      itemStyle={{ color: "var(--color-ui-foreground)" }}
                      labelStyle={{ color: "var(--color-ui-foreground-muted)" }}
                    />
                    <Legend
                      wrapperStyle={{
                        color: "var(--color-ui-foreground)",
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
                    {showAverageSeries ? (
                      <Line
                        type="monotone"
                        dataKey="average"
                        name="Durchschnitt"
                        stroke="var(--color-chart-average)"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                        connectNulls
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </section>
    </ViewOverlayShell>
  );
};
