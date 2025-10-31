import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MdCo2 } from "react-icons/md";
import { useCO2Store } from "../stores/co2Store";
import { registerWebSocketListener } from "../services/websocket-service";

interface CO2CardProps {
  location?: string;
}

const CO2Card: React.FC<CO2CardProps> = ({ location }) => {
  const { currentValue, loading, error, getRecentHistory, initialize } =
    useCO2Store();

  // Initialize the store with location when component mounts
  React.useEffect(() => {
    const initStore = async () => {
      await initialize(location);
      registerWebSocketListener((itemName, value) =>
        useCO2Store.getState().handleWebSocketMessage(itemName, value)
      );
    };
    initStore();
  }, [initialize, location]);

  const getBackgroundTint = (value: number | null) => {
    if (value === null)
      return "bg-gradient-to-t from-surface/40 to-transparent";
    if (value < 800) return "bg-gradient-to-t from-green-500/30 to-transparent";
    if (value <= 1200)
      return "bg-gradient-to-t from-amber-500/30 to-transparent";
    return "bg-gradient-to-t from-red-500/30 to-transparent";
  };

  const recentHistory = getRecentHistory(6); // Last 6 hours

  // Prepare chart data
  const chartData = (() => {
    const allTimes = new Set<number>();
    Object.values(recentHistory).forEach((points) =>
      points.forEach((p) => allTimes.add(p.timestamp))
    );
    const sortedTimes = Array.from(allTimes).sort();

    return sortedTimes.map((time) => {
      const dataPoint: Record<string, unknown> = {
        time: new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      Object.keys(recentHistory).forEach((itemName) => {
        const points = recentHistory[itemName];
        const point = points.find((p) => p.timestamp === time);
        dataPoint[itemName] = point ? point.value : null;
      });
      return dataPoint;
    });
  })();

  return (
    <div className="w-full rounded-2xl p-8 relative overflow-hidden bg-surface/60">
      {/* Glass structure layers */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-black/5"></div>
      <div className="absolute inset-0 rounded-2xl border border-white/30 shadow-2xl shadow-black/20"></div>
      <div className="absolute inset-[1px] rounded-[14px] border border-white/10"></div>
      <div className="absolute inset-0 rounded-2xl backdrop-blur-xl backdrop-saturate-200"></div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 via-transparent to-white/5"></div>
      {/* Subtle state gradient overlay */}
      <div
        className={`absolute inset-0 rounded-2xl ${getBackgroundTint(
          currentValue
        )}`}
      ></div>

      {/* Chart background */}
      {chartData.length > 0 && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 16, right: 8, left: 8, bottom: 16 }}
            >
              {Object.keys(recentHistory).map((itemName, idx) => (
                <Line
                  key={itemName}
                  dataKey={itemName}
                  stroke={`hsl(${200 + idx * 60}, 80%, 55%)`}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={true}
                />
              ))}
              <XAxis dataKey="time" hide={true} />
              <YAxis domain={["auto", "auto"]} hide={true} />
              <Tooltip contentStyle={{ display: "none" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="relative z-10">
        <div className="absolute top-2 left-2">
          <MdCo2 className="w-8 h-8 text-white/80 drop-shadow-lg" />
        </div>
        <div className="pt-12">
          {loading ? (
            <p>Loading…</p>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : currentValue !== null ? (
            <div className="text-5xl font-bold text-white drop-shadow-lg">
              {currentValue.toFixed(0)} ppm
            </div>
          ) : (
            <p>No CO2 data found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CO2Card;
