import { useMemo } from "react";
import {
  formatLocalizedNumber,
  type LocaleInput,
} from "../../../services/number-format";
import { useViewStore } from "../../../stores/viewStore";
import type { EvccControlDefinition } from "../controlDefinitions";

export type EvccVehicleLogoKey = "kia" | "skoda";
export type EvccHudState = "disconnected" | "connected-idle" | "charging";

export interface EvccDisplayState {
  connected: boolean;
  charging: boolean;
  hudState: EvccHudState;
  mode: string | null;
  vehicleName: string | null;
  vehicleTitle: string | null;
  vehicleDisplayName: string | null;
  vehicleLogoKey: EvccVehicleLogoKey | null;
  vehicleSoc: number | null;
  vehicleSocDisplay: string | null;
  vehicleRangeKm: number | null;
  vehicleRangeDisplay: string | null;
  activePhases: number | null;
  chargePowerKw: number | null;
  chargePowerHudDisplay: string | null;
  chargePowerDisplay: string | null;
  limitSoc: number | null;
  limitSocDisplay: string | null;
  effectiveLimitSoc: number | null;
  effectiveLimitSocDisplay: string | null;
  effectivePlanId: number | null;
  effectivePlanSoc: number | null;
  effectivePlanSocDisplay: string | null;
  effectivePlanTime: Date | null;
  effectivePlanTimeDisplay: string | null;
  effectivePlanStatusDisplay: string;
  repeatingPlanActive: boolean | null;
}

const NULLISH_STATE_VALUES = new Set(["UNDEF", "NULL", "-"]);

export const normalizeEvccStateValue = (
  rawState: string | undefined
): string | null => {
  if (!rawState) {
    return null;
  }

  const trimmed = rawState.trim();
  if (trimmed.length === 0 || NULLISH_STATE_VALUES.has(trimmed.toUpperCase())) {
    return null;
  }

  return trimmed;
};

const parseNumericValue = (rawState: string | undefined): number | null => {
  const normalized = normalizeEvccStateValue(rawState);
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return null;
  }

  const value = Number.parseFloat(match[0].replace(",", "."));
  return Number.isFinite(value) ? value : null;
};

const parsePercentValue = (rawState: string | undefined): number | null => {
  const value = parseNumericValue(rawState);
  const normalized = normalizeEvccStateValue(rawState);
  if (value === null || !normalized) {
    return null;
  }

  if (normalized.includes("%")) {
    return value;
  }

  return value > 0 && value <= 1 ? value * 100 : value;
};

const roundToInt = (value: number): number => Math.round(value);

const formatPercent = (value: number | null): string | null =>
  value === null ? null : `${roundToInt(value)}%`;

const formatRange = (value: number | null): string | null =>
  value === null ? null : `${roundToInt(value)} km`;

const formatPower = (
  value: number | null,
  locale?: LocaleInput
): string | null =>
  value === null
    ? null
    : formatLocalizedNumber(
        value,
        {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        },
        locale
      );

const resolveOnOffState = (rawState: string | undefined): boolean =>
  normalizeEvccStateValue(rawState)?.toUpperCase() === "ON";

const resolveNullableOnOffState = (rawState: string | undefined): boolean | null => {
  const normalized = normalizeEvccStateValue(rawState)?.toUpperCase();
  if (!normalized) {
    return null;
  }
  if (normalized === "ON") {
    return true;
  }
  if (normalized === "OFF") {
    return false;
  }
  return null;
};

const resolvePowerKw = (rawState: string | undefined): number | null => {
  const value = parseNumericValue(rawState);
  const normalized = normalizeEvccStateValue(rawState);
  if (value === null || !normalized) {
    return null;
  }

  return /\bKW\b/i.test(normalized) ? value : value / 1000;
};

const resolveRangeKm = (rawState: string | undefined): number | null => {
  const value = parseNumericValue(rawState);
  const normalized = normalizeEvccStateValue(rawState);
  if (value === null || !normalized) {
    return null;
  }

  if (/\bM\b/i.test(normalized) && !/\bKM\b/i.test(normalized)) {
    return value / 1000;
  }
  return value;
};

const parseDateTimeValue = (rawState: string | undefined): Date | null => {
  const normalized = normalizeEvccStateValue(rawState)?.replace(/\[[^\]]+\]$/, "");
  if (!normalized) {
    return null;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatPlanTime = (
  value: Date | null,
  locale?: LocaleInput,
  now = new Date()
): string | null => {
  if (!value) {
    return null;
  }

  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const planDay = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const diffDays = Math.round(
    (planDay.getTime() - currentDay.getTime()) / 86_400_000
  );
  const dayLabel =
    diffDays === 0
      ? "heute"
      : diffDays === 1
        ? "morgen"
        : new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "2-digit",
          }).format(value);
  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

  return `${dayLabel} ${timeLabel}`;
};

const formatPlanStatus = ({
  effectivePlanId,
  effectivePlanSoc,
  effectivePlanTime,
  locale,
  now,
}: {
  effectivePlanId: number | null;
  effectivePlanSoc: number | null;
  effectivePlanTime: Date | null;
  locale?: LocaleInput;
  now?: Date;
}): string => {
  const socDisplay = formatPercent(effectivePlanSoc);
  const timeDisplay = formatPlanTime(effectivePlanTime, locale, now);
  if (effectivePlanId === null || !socDisplay || !timeDisplay) {
    return "Keine Ladeplanung aktiv";
  }

  const planType = effectivePlanId === 0 ? "Einmalplan" : "Wiederholender Plan";
  return `${planType}: ${socDisplay} bis ${timeDisplay}`;
};

export const resolveEvccVehicleLogoKey = (
  vehicleName: string | null,
  vehicleTitle: string | null
): EvccVehicleLogoKey | null => {
  const normalized = `${vehicleName ?? ""} ${vehicleTitle ?? ""}`.toLowerCase();
  if (normalized.includes("ev6") || normalized.includes("kia")) {
    return "kia";
  }
  if (normalized.includes("enyaq") || normalized.includes("skoda")) {
    return "skoda";
  }
  return null;
};

export const resolveEvccDisplayState = ({
  connectedRawState,
  chargingRawState,
  modeRawState,
  vehicleSocRawState,
  vehicleRangeRawState,
  vehicleNameRawState,
  vehicleTitleRawState,
  activePhasesRawState,
  chargePowerRawState,
  limitSocRawState,
  effectiveLimitSocRawState,
  effectivePlanIdRawState,
  effectivePlanSocRawState,
  effectivePlanTimeRawState,
  repeatingPlanActiveRawState,
  locale,
  now,
}: {
  connectedRawState: string | undefined;
  chargingRawState: string | undefined;
  modeRawState: string | undefined;
  vehicleSocRawState: string | undefined;
  vehicleRangeRawState: string | undefined;
  vehicleNameRawState: string | undefined;
  vehicleTitleRawState: string | undefined;
  activePhasesRawState: string | undefined;
  chargePowerRawState: string | undefined;
  limitSocRawState: string | undefined;
  effectiveLimitSocRawState: string | undefined;
  effectivePlanIdRawState?: string | undefined;
  effectivePlanSocRawState?: string | undefined;
  effectivePlanTimeRawState?: string | undefined;
  repeatingPlanActiveRawState?: string | undefined;
  locale?: LocaleInput;
  now?: Date;
}): EvccDisplayState => {
  const connected = resolveOnOffState(connectedRawState);
  const charging = connected && resolveOnOffState(chargingRawState);
  const vehicleName = normalizeEvccStateValue(vehicleNameRawState);
  const vehicleTitle = normalizeEvccStateValue(vehicleTitleRawState);
  const vehicleDisplayName = vehicleTitle ?? vehicleName;
  const vehicleSoc = parsePercentValue(vehicleSocRawState);
  const vehicleRangeKm = resolveRangeKm(vehicleRangeRawState);
  const activePhases = parseNumericValue(activePhasesRawState);
  const chargePowerKw = resolvePowerKw(chargePowerRawState);
  const limitSoc = parsePercentValue(limitSocRawState);
  const effectiveLimitSoc = parsePercentValue(effectiveLimitSocRawState);
  const effectivePlanId = parseNumericValue(effectivePlanIdRawState);
  const effectivePlanSoc = parsePercentValue(effectivePlanSocRawState);
  const effectivePlanTime = parseDateTimeValue(effectivePlanTimeRawState);

  return {
    connected,
    charging,
    hudState: !connected ? "disconnected" : charging ? "charging" : "connected-idle",
    mode: normalizeEvccStateValue(modeRawState),
    vehicleName,
    vehicleTitle,
    vehicleDisplayName,
    vehicleLogoKey: resolveEvccVehicleLogoKey(vehicleName, vehicleTitle),
    vehicleSoc,
    vehicleSocDisplay: formatPercent(vehicleSoc),
    vehicleRangeKm,
    vehicleRangeDisplay: formatRange(vehicleRangeKm),
    activePhases: activePhases === null ? null : roundToInt(activePhases),
    chargePowerKw,
    chargePowerHudDisplay: formatPower(chargePowerKw, locale),
    chargePowerDisplay:
      chargePowerKw === null ? null : `${formatPower(chargePowerKw, locale)} kW`,
    limitSoc,
    limitSocDisplay: formatPercent(limitSoc),
    effectiveLimitSoc,
    effectiveLimitSocDisplay: formatPercent(effectiveLimitSoc),
    effectivePlanId:
      effectivePlanId === null ? null : roundToInt(effectivePlanId),
    effectivePlanSoc,
    effectivePlanSocDisplay: formatPercent(effectivePlanSoc),
    effectivePlanTime,
    effectivePlanTimeDisplay: formatPlanTime(effectivePlanTime, locale, now),
    effectivePlanStatusDisplay: formatPlanStatus({
      effectivePlanId:
        effectivePlanId === null ? null : roundToInt(effectivePlanId),
      effectivePlanSoc,
      effectivePlanTime,
      locale,
      now,
    }),
    repeatingPlanActive: resolveNullableOnOffState(repeatingPlanActiveRawState),
  };
};

export const useEvccControlModel = (definition: EvccControlDefinition) => {
  const itemStates = useViewStore((state) => state.itemStates);

  return useMemo(
    () =>
      resolveEvccDisplayState({
        connectedRawState:
          itemStates[definition.itemRefs.connectedItemName]?.rawState,
        chargingRawState:
          itemStates[definition.itemRefs.chargingItemName]?.rawState,
        modeRawState: itemStates[definition.itemRefs.modeItemName]?.rawState,
        vehicleSocRawState:
          itemStates[definition.itemRefs.vehicleSocItemName]?.rawState,
        vehicleRangeRawState:
          itemStates[definition.itemRefs.vehicleRangeItemName]?.rawState,
        vehicleNameRawState:
          itemStates[definition.itemRefs.vehicleNameItemName]?.rawState,
        vehicleTitleRawState:
          itemStates[definition.itemRefs.vehicleTitleItemName]?.rawState,
        activePhasesRawState:
          itemStates[definition.itemRefs.activePhasesItemName]?.rawState,
        chargePowerRawState:
          itemStates[definition.itemRefs.chargePowerItemName]?.rawState,
        limitSocRawState:
          itemStates[definition.itemRefs.limitSocItemName]?.rawState,
        effectiveLimitSocRawState:
          itemStates[definition.itemRefs.effectiveLimitSocItemName]?.rawState,
        effectivePlanIdRawState: definition.itemRefs.effectivePlanIdItemName
          ? itemStates[definition.itemRefs.effectivePlanIdItemName]?.rawState
          : undefined,
        effectivePlanSocRawState: definition.itemRefs.effectivePlanSocItemName
          ? itemStates[definition.itemRefs.effectivePlanSocItemName]?.rawState
          : undefined,
        effectivePlanTimeRawState: definition.itemRefs.effectivePlanTimeItemName
          ? itemStates[definition.itemRefs.effectivePlanTimeItemName]?.rawState
          : undefined,
        repeatingPlanActiveRawState: definition.itemRefs.repeatingPlanActiveItemName
          ? itemStates[definition.itemRefs.repeatingPlanActiveItemName]?.rawState
          : undefined,
      }),
    [definition, itemStates]
  );
};
