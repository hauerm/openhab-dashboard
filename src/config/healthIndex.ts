export const HEALTH_INDEX_LABELS_DE = {
  0: "Gesund",
  1: "Gut",
  2: "Mäßig",
  3: "Schlecht",
  4: "Ungesund",
} as const;

export type HealthIndexLevel = keyof typeof HEALTH_INDEX_LABELS_DE;

export const normalizeHealthIndex = (value: number): HealthIndexLevel | null => {
  if (!Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  if (rounded < 0 || rounded > 4) {
    return null;
  }

  return rounded as HealthIndexLevel;
};

export const getHealthIndexLabel = (value: number): string | null => {
  const level = normalizeHealthIndex(value);
  if (level === null) {
    return null;
  }
  return HEALTH_INDEX_LABELS_DE[level];
};
