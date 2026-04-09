import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  BACKGROUND_TINT_CLASSES,
  type BackgroundTintBand,
  SEMANTIC_CONFIGS,
} from "../config/semanticTypes";
import { createSemanticStore } from "../stores/semanticStore";
import { PROPERTY_AIR_QUALITY, PROPERTY_TEMPERATURE } from "../services/config";
import { getHealthIndexLabel } from "../config/healthIndex";

interface SemanticCardProps {
  semanticProperty: string;
  location?: string;
  showHistory?: boolean;
  title?: string;
  className?: string;
}

type ChartRow = Record<string, string | number | null>;
type HistoryPoint = { timestamp: number; value: number };
const HISTORY_LINE_COLORS = ["#7DD3FC", "#A7F3D0", "#FDE68A", "#FCA5A5"];

/**
 * Generic card component for displaying environmental sensor data.
 */
const SemanticCard: React.FC<SemanticCardProps> = ({
  semanticProperty,
  location,
  showHistory = true,
  title,
  className = "",
}) => {
  const config = SEMANTIC_CONFIGS[semanticProperty];
  const resolvedConfig = config ?? SEMANTIC_CONFIGS[PROPERTY_TEMPERATURE];
  const scopeKey = location?.trim() || "__all__";

  const useStore = React.useMemo(
    () => createSemanticStore(resolvedConfig, scopeKey),
    [resolvedConfig, scopeKey]
  );

  const initialize = useStore((state) => state.initialize);
  const history = useStore((state) => state.history);
  const currentValue = useStore((state) => state.currentValue);
  const currentValueStatus = useStore((state) => state.currentValueStatus);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);

  React.useEffect(() => {
    void initialize(location);
  }, [initialize, location]);

  const recentHistory = React.useMemo(() => {
    const cutoff = Date.now() - resolvedConfig.historyHours * 3600000;
    const filteredHistory: Record<string, HistoryPoint[]> = {};

    for (const [itemName, points] of Object.entries(history)) {
      const inWindow = points.filter((point) => point.timestamp >= cutoff);
      filteredHistory[itemName] = inWindow.length > 0 ? inWindow : points;
    }

    return filteredHistory;
  }, [history, resolvedConfig.historyHours]);

  const chartData = React.useMemo(() => {
    if (!showHistory) {
      return [];
    }

    const rowsByTimestamp = new Map<number, ChartRow>();

    for (const [itemName, points] of Object.entries(recentHistory)) {
      for (const point of points) {
        const row = rowsByTimestamp.get(point.timestamp) ?? {
          timestamp: point.timestamp,
        };
        row[itemName] = point.value;
        rowsByTimestamp.set(point.timestamp, row);
      }
    }

    return Array.from(rowsByTimestamp.values())
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
      .map((row) => {
        const timestamp = Number(row.timestamp);
        return {
          ...row,
          time: new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });
  }, [recentHistory, showHistory]);

  const getBackgroundTint = (
    value: number | null,
    bands: BackgroundTintBand[]
  ) => {
    if (value === null) {
      return "bg-gradient-to-t from-slate-600/25 to-transparent";
    }

    for (const band of bands) {
      const minOk = band.min === undefined || value >= band.min;
      const maxOk = band.max === undefined || value <= band.max;
      if (minOk && maxOk) {
        return BACKGROUND_TINT_CLASSES[band.level];
      }
    }

    return "bg-gradient-to-t from-slate-600/25 to-transparent";
  };

  if (!config) {
    return (
      <div className={`w-full rounded-2xl p-8 bg-slate-900/40 ${className}`}>
        <p className="text-red-400">Unknown semantic property: {semanticProperty}</p>
      </div>
    );
  }

  const Icon = config.icon;
  const isAirQuality = config.property === PROPERTY_AIR_QUALITY;
  const healthIndexLabel =
    isAirQuality && currentValue !== null ? getHealthIndexLabel(currentValue) : null;
  const formattedValue =
    isAirQuality ? currentValue?.toFixed(0) : currentValue?.toFixed(1);

  return (
    <div
      className={`w-full rounded-2xl p-8 relative overflow-hidden bg-slate-900/40 ${className}`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-white/5"></div>
      <div className="absolute inset-0 rounded-2xl border border-white/25 shadow-2xl shadow-black/10"></div>
      <div className="absolute inset-[1px] rounded-[14px] border border-white/10"></div>
      <div className="absolute inset-0 rounded-2xl backdrop-blur-xl backdrop-saturate-150"></div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/5 via-transparent to-white/10"></div>
      <div
        className={`absolute inset-0 rounded-2xl ${getBackgroundTint(
          currentValue,
          config.backgroundTintBands
        )}`}
      ></div>

      {showHistory && chartData.length > 0 && (
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 16, right: 8, left: 8, bottom: 16 }}
            >
              {Object.keys(recentHistory).map((itemName, idx) => {
                const color = HISTORY_LINE_COLORS[idx % HISTORY_LINE_COLORS.length];
                const pointCount = recentHistory[itemName]?.length ?? 0;
                return (
                  <Line
                    key={itemName}
                    dataKey={itemName}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={
                      pointCount <= 1
                        ? { r: 2.5, fill: color, stroke: color }
                        : false
                    }
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                );
              })}
              <XAxis dataKey="time" hide={true} />
              <YAxis domain={["auto", "auto"]} hide={true} />
              <Tooltip contentStyle={{ display: "none" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative z-10">
        <div className="absolute top-2 left-2">
          <Icon className="w-8 h-8 text-white/80 drop-shadow-lg" />
        </div>
        <div className="pt-12">
          {loading ? (
            <p className="text-white/60">Loading...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : currentValue !== null ? (
            <div>
              <div className="text-5xl font-bold text-white drop-shadow-lg">
                {healthIndexLabel ?? formattedValue}
                {!healthIndexLabel && (
                  <span className="text-2xl font-normal text-white/80 ml-1">
                    {config.unit}
                  </span>
                )}
              </div>
              {title && <div className="text-sm text-white/60 mt-2">{title}</div>}
            </div>
          ) : currentValueStatus === "unavailable" ? (
            <p className="text-white/60">Value unavailable (UNDEF/NULL/offline).</p>
          ) : (
            <p className="text-white/60">
              No {config.title.toLowerCase()} data found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SemanticCard;
