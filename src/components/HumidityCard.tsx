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

function HumidityCard() {
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ItemHistoryDatapoint[] | null>(null);

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

        // Fetch history for the first humidity item for the last 12 hours
        if (humidity.length > 0) {
          const now = new Date();
          const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
          const starttime = twelveHoursAgo.toISOString();
          const endtime = now.toISOString();
          try {
            const hist = await getItemHistory(humidity[0].name, {
              starttime,
              endtime,
            });
            setHistory(hist.data);
            // console.log("History data:", humidity[0].name, hist.data);
          } catch (e) {
            console.error("Failed to load history data", e);
            setHistory(null);
          }
        } else {
          setHistory(null);
        }
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
    <div className="max-w-[400px] mx-auto my-8 shadow-lg rounded-2xl p-8 bg-surface relative overflow-hidden">
      {/* Chart background */}
      {history && history.length > 1 && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history.map((d) => ({
                ...d,
                state: parseFloat(d.state),
                time: new Date(d.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }))}
              margin={{ top: 16, right: 8, left: 8, bottom: 16 }}
            >
              <XAxis dataKey="time" hide={true} />
              <YAxis domain={["auto", "auto"]} hide={true} />
              <Line
                type="monotone"
                dataKey="state"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={false}
              />
              <Tooltip contentStyle={{ display: "none" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          {/* Humidity/ground floor icon (Heroicons: Home Modern + Droplet) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="w-8 h-8 text-primary-500"
          >
            <path
              d="M12 3L2 12h3v7a1 1 0 001 1h4m6-8v8a1 1 0 001 1h4a1 1 0 001-1v-7h3L12 3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17a4 4 0 11-8 0c0-2.21 4-7 4-7s4 4.79 4 7z"
              fill="currentColor"
              fillOpacity=".15"
            />
            <path
              d="M12 21a4 4 0 004-4c0-2.21-4-7-4-7s-4 4.79-4 7a4 4 0 004 4z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-primary font-bold text-2xl">Erdgeschoss</span>
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
