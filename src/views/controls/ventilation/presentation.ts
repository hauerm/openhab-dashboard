import {
  HELIOS_MANUAL_LEVEL_LABELS,
  type HeliosManualLevel,
} from "../../../types/ventilation";

const formatHeliosLevel = (level: HeliosManualLevel | null): string => {
  if (level === null) {
    return "--";
  }

  return HELIOS_MANUAL_LEVEL_LABELS[level];
};

export const formatVentilationDecorator = (
  manualLevel: HeliosManualLevel | null,
  actualLevel: HeliosManualLevel | null
): string => {
  if (manualLevel === -1) {
    return `Auto (${formatHeliosLevel(actualLevel)})`;
  }

  return `Manual (${formatHeliosLevel(manualLevel)})`;
};

export const formatVentilationBadge = (
  manualLevel: HeliosManualLevel | null,
  actualLevel: HeliosManualLevel | null
): string => {
  if (manualLevel === -1) {
    return `A${actualLevel === null ? "-" : actualLevel}`;
  }

  return `M${manualLevel === null ? "-" : manualLevel}`;
};
