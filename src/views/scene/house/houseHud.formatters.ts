const NUMERIC_PREFIX_REGEX = /-?\d+(?:[.,]\d+)?/;

const parseNumericFromRawState = (
  rawState: string | undefined
): number | null => {
  if (!rawState) {
    return null;
  }
  const numericMatch = rawState.trim().match(NUMERIC_PREFIX_REGEX);
  if (!numericMatch) {
    return null;
  }
  const parsed = Number.parseFloat(numericMatch[0].replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
};

export const formatHouseTemperature = (rawState: string | undefined): string => {
  const value = parseNumericFromRawState(rawState);
  if (value === null) {
    return "--";
  }
  return `${value.toFixed(1)} °C`;
};

const isOnToken = (value: string | undefined): boolean | null => {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "ON") {
    return true;
  }
  if (normalized === "OFF") {
    return false;
  }
  if (normalized === "UNDEF" || normalized === "NULL" || normalized === "-") {
    return null;
  }
  return null;
};

export const formatWeatherStatus = (
  rainRawState: string | undefined,
  brightnessRawState?: string
): string => {
  const rain = isOnToken(rainRawState);
  if (rain === true) {
    return "Regen";
  }

  const brightness = parseNumericFromRawState(brightnessRawState);

  if (rain === false) {
    if (brightness === null) {
      return "Trocken";
    }
    return brightness < 1000 ? "Trocken (dunkel)" : "Trocken";
  }

  if (brightness !== null) {
    return `Helligkeit ${Math.round(brightness)} lx`;
  }

  return "--";
};

export const formatNightStatus = (phaseRawState: string | undefined): string => {
  if (!phaseRawState) {
    return "--";
  }
  const normalized = phaseRawState.trim().toUpperCase();
  if (normalized.includes("NIGHT") || normalized.includes("NACHT")) {
    return "Nacht";
  }
  if (normalized.includes("DAY") || normalized.includes("TAG")) {
    return "Tag";
  }
  return phaseRawState;
};

