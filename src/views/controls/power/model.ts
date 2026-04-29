import { useMemo } from "react";
import {
  formatLocalizedNumber,
  type LocaleInput,
} from "../../../services/number-format";
import { useViewStore } from "../../../stores/viewStore";
import type { PowerControlDefinition } from "../controlDefinitions";

export interface PowerControlDisplayState {
  isOn: boolean;
  consumptionDisplay: string | null;
}

const NULLISH_STATE_VALUES = new Set(["UNDEF", "NULL", "-"]);

const normalizeRawState = (rawState: string | undefined): string | null => {
  if (!rawState) {
    return null;
  }

  const trimmed = rawState.trim();
  if (trimmed.length === 0 || NULLISH_STATE_VALUES.has(trimmed.toUpperCase())) {
    return null;
  }

  return trimmed;
};

const formatNumber = (value: number, locale?: LocaleInput): string => {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return formatLocalizedNumber(
    value,
    {
      maximumFractionDigits: value < 100 ? 1 : 0,
    },
    locale
  );
};

export const resolvePowerConsumptionDisplay = (
  rawState: string | undefined,
  locale?: LocaleInput
): string | null => {
  const normalizedState = normalizeRawState(rawState);
  if (!normalizedState) {
    return null;
  }

  const match = normalizedState.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return normalizedState;
  }

  const parsed = Number.parseFloat(match[0].replace(",", "."));
  if (Number.isNaN(parsed)) {
    return normalizedState;
  }

  const normalizedUpper = normalizedState.toUpperCase();
  const watts = /\bKW\b/.test(normalizedUpper) ? parsed * 1000 : parsed;
  if (Math.abs(watts) >= 1000) {
    return `${formatNumber(watts / 1000, locale)} kW`;
  }

  return `${formatNumber(watts, locale)} W`;
};

export const resolvePowerControlDisplayState = (
  powerRawState: string | undefined,
  consumptionRawState: string | undefined
): PowerControlDisplayState => ({
  isOn: normalizeRawState(powerRawState)?.toUpperCase() === "ON",
  consumptionDisplay: resolvePowerConsumptionDisplay(consumptionRawState),
});

export const usePowerControlModel = (definition: PowerControlDefinition) => {
  const itemStates = useViewStore((state) => state.itemStates);

  return useMemo(() => {
    const powerRawState = itemStates[definition.itemRefs.powerItemName]?.rawState;
    const consumptionRawState =
      itemStates[definition.itemRefs.consumptionItemName]?.rawState;
    const displayState = resolvePowerControlDisplayState(
      powerRawState,
      consumptionRawState
    );

    return {
      powerRawState,
      consumptionRawState,
      ...displayState,
    };
  }, [definition, itemStates]);
};
