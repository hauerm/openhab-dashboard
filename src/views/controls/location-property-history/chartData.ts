export type HistoryPoint = {
  timestamp: number;
  value: number;
};

export type ChartRow = {
  timestamp: number;
  average: number | null;
  [series: string]: number | null;
};

export const shouldShowAverageSeries = (seriesKeys: string[]): boolean =>
  seriesKeys.length > 1;

export const buildLocationPropertyHistoryChartData = (
  filteredHistory: Record<string, HistoryPoint[]>,
  seriesKeys: string[]
): ChartRow[] => {
  const rowsByTimestamp = new Map<number, Record<string, number>>();
  const includeAverage = shouldShowAverageSeries(seriesKeys);

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

      row.average = includeAverage && count > 1 ? sum / count : null;
      return row;
    });
};
