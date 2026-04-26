import { describe, expect, it } from "vitest";
import {
  buildLocationPropertyHistoryChartData,
  shouldShowAverageSeries,
} from "./chartData";

describe("location property history chart data", () => {
  it("does not show an average series for a single measurement series", () => {
    const chartData = buildLocationPropertyHistoryChartData(
      {
        Sensor_A: [
          { timestamp: 1000, value: 21 },
          { timestamp: 2000, value: 22 },
        ],
      },
      ["Sensor_A"]
    );

    expect(shouldShowAverageSeries(["Sensor_A"])).toBe(false);
    expect(chartData).toEqual([
      { timestamp: 1000, average: null, Sensor_A: 21 },
      { timestamp: 2000, average: null, Sensor_A: 22 },
    ]);
  });

  it("averages only timestamps with multiple measurement values", () => {
    const chartData = buildLocationPropertyHistoryChartData(
      {
        Sensor_A: [
          { timestamp: 1000, value: 20 },
          { timestamp: 2000, value: 22 },
        ],
        Sensor_B: [{ timestamp: 1000, value: 24 }],
      },
      ["Sensor_A", "Sensor_B"]
    );

    expect(shouldShowAverageSeries(["Sensor_A", "Sensor_B"])).toBe(true);
    expect(chartData).toEqual([
      { timestamp: 1000, average: 22, Sensor_A: 20, Sensor_B: 24 },
      { timestamp: 2000, average: null, Sensor_A: 22, Sensor_B: null },
    ]);
  });
});
