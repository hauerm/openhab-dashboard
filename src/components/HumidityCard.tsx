import { useEffect, useState } from "react";
import {
  fetchItems,
  filterItemsBySemanticProperty,
  PROPERTY_HUMIDITY,
  getItemHistory,
} from "../services/openhab-service";
import type { ItemHistoryDatapoint } from "../types/item";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MdWaterDrop } from "react-icons/md";

function HumidityCard() {
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Store history as array of { name, label, history: ItemHistoryDatapoint[] }
  const [history, setHistory] = useState<
    {
      name: string;
      label: string;
      history: ItemHistoryDatapoint[];
    }[]
  >([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchItems();
        const humidity = filterItemsBySemanticProperty(
          items,
          PROPERTY_HUMIDITY
        );
        // Extract numeric humidity values
        const values = humidity
          .map((item) => {
            const match = item.state.match(/([\d.]+)/);
            return match ? parseFloat(match[1]) : null;
          })
          .filter((v): v is number => v !== null && !isNaN(v));
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          setAverage(avg);
        } else {
          setAverage(null);
        }

        const histories = await Promise.all(
          humidity.map(async (item) => {
            const now = new Date();
            const twelveHoursAgo = new Date(
              now.getTime() - 12 * 60 * 60 * 1000
            );
            const starttime = twelveHoursAgo.toISOString();
            const endtime = now.toISOString();
            try {
              const hist = await getItemHistory(item.name, {
                starttime,
                endtime,
              });
              return {
                name: item.name,
                label: item.label || item.name,
                history: hist.data,
              };
            } catch (e) {
              console.error(`Failed to load history for ${item.name}`, e);
              return {
                name: item.name,
                label: item.label || item.name,
                history: [],
              };
            }
          })
        );
        setHistory(histories);
      } catch (e) {
        console.error("Failed to load humidity data", e);
        setError("Failed to load humidity data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-[400px] mx-auto my-8 rounded-2xl p-8 bg-surface/60 shadow-xl border border-white/20 backdrop-blur-md backdrop-saturate-150 relative overflow-hidden">
      {/* Chart background */}
      {history &&
        history.length > 0 &&
        history.some((h) => h.history.length > 1) && (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              {/*
                Interpolate missing values for each series by building a unified time axis,
                then forward-filling each series to ensure continuous lines.
              */}
              {(() => {
                // 1. Collect all unique time points across all series
                const allTimesSet = new Set<string>();
                history.forEach((h) => {
                  h.history.forEach((d) => {
                    allTimesSet.add(
                      new Date(d.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    );
                  });
                });
                const allTimes = Array.from(allTimesSet).sort();

                // 2. For each series, build a map of time -> value
                const seriesData = history.map((h) => {
                  const timeToValue = new Map<string, number>();
                  h.history.forEach((d) => {
                    const t = new Date(d.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    timeToValue.set(t, parseFloat(d.state));
                  });
                  // Forward fill
                  let lastValue: number | null = null;
                  const data = allTimes.map((t) => {
                    const v = timeToValue.has(t)
                      ? timeToValue.get(t)!
                      : lastValue;
                    if (v !== undefined && v !== null) lastValue = v;
                    return { time: t, state: v };
                  });
                  return { name: h.name, label: h.label, data };
                });

                return (
                  <LineChart
                    data={seriesData[0].data}
                    margin={{ top: 16, right: 8, left: 8, bottom: 16 }}
                  >
                    {seriesData.map((s, idx) => (
                      <Line
                        key={s.name}
                        data={s.data}
                        type="monotone"
                        dataKey="state"
                        name={s.label}
                        stroke={`hsl(${200 + idx * 60}, 80%, 55%)`}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                    ))}
                    <XAxis
                      dataKey="time"
                      hide={true}
                      type="category"
                      allowDuplicatedCategory={false}
                    />
                    <YAxis domain={["auto", "auto"]} hide={true} />
                    <Tooltip contentStyle={{ display: "none" }} />
                  </LineChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
        )}
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <MdWaterDrop className="w-8 h-8 text-primary-500" />
          <span className="text-primary font-bold text-2xl">Erdgeschoss</span>
          <span className="text-primary font-bold text-2xl">&#216;</span>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : average !== null ? (
          <div className="text-5xl font-bold text-primary">
            {average.toFixed(1)}%
          </div>
        ) : (
          <p>No humidity data found.</p>
        )}
        {/* Removed item names for a cleaner card UI */}
      </div>
    </div>
  );
}

export default HumidityCard;
