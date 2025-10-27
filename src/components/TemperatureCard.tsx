import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MdThermostat } from "react-icons/md";
import { useTemperatureStore } from "../stores/temperatureStore";

const TemperatureCard: React.FC = () => {
  const { currentValue, loading, error, getRecentHistory } =
    useTemperatureStore();

  const getColor = (value: number | null) => {
    if (value === null) return "text-gray-500";
    if (value < 18) return "text-blue-500";
    if (value <= 25) return "text-green-500";
    return "text-red-500";
  };

  const getIconColor = (value: number | null) => {
    if (value === null) return "text-gray-500";
    if (value < 18) return "text-blue-500";
    if (value <= 25) return "text-green-500";
    return "text-red-500";
  };

  const recentHistory = getRecentHistory(10); // Last 2 hours

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
    <div className="w-full rounded-2xl p-8 bg-surface/60 shadow-xl border border-white/20 backdrop-blur-md backdrop-saturate-150 relative overflow-hidden">
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
          <MdThermostat className={`w-8 h-8 ${getIconColor(currentValue)}`} />
        </div>
        <div className="pt-12">
          {loading ? (
            <p>Loading…</p>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : currentValue !== null ? (
            <div className={`text-5xl font-bold ${getColor(currentValue)}`}>
              {currentValue.toFixed(1)}°C
            </div>
          ) : (
            <p>No temperature data found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemperatureCard;
