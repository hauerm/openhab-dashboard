import { useMemo } from "react";
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

const roundToInt = (value: number): number => Math.round(value);

const formatPercent = (value: number | null): string | null =>
  value === null ? null : `${roundToInt(value)}%`;

const formatRange = (value: number | null): string | null =>
  value === null ? null : `${roundToInt(value)} km`;

const formatPower = (value: number | null): string | null =>
  value === null ? null : value.toFixed(1);

const resolveOnOffState = (rawState: string | undefined): boolean =>
  normalizeEvccStateValue(rawState)?.toUpperCase() === "ON";

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
}): EvccDisplayState => {
  const connected = resolveOnOffState(connectedRawState);
  const charging = connected && resolveOnOffState(chargingRawState);
  const vehicleName = normalizeEvccStateValue(vehicleNameRawState);
  const vehicleTitle = normalizeEvccStateValue(vehicleTitleRawState);
  const vehicleDisplayName = vehicleTitle ?? vehicleName;
  const vehicleSoc = parseNumericValue(vehicleSocRawState);
  const vehicleRangeKm = resolveRangeKm(vehicleRangeRawState);
  const activePhases = parseNumericValue(activePhasesRawState);
  const chargePowerKw = resolvePowerKw(chargePowerRawState);
  const limitSoc = parseNumericValue(limitSocRawState);
  const effectiveLimitSoc = parseNumericValue(effectiveLimitSocRawState);

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
    chargePowerHudDisplay: formatPower(chargePowerKw),
    chargePowerDisplay:
      chargePowerKw === null ? null : `${formatPower(chargePowerKw)} kW`,
    limitSoc,
    limitSocDisplay: formatPercent(limitSoc),
    effectiveLimitSoc,
    effectiveLimitSocDisplay: formatPercent(effectiveLimitSoc),
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
      }),
    [definition, itemStates]
  );
};
