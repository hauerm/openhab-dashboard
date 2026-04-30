import { describe, expect, it } from "vitest";
import {
  resolveEvccDisplayState,
  resolveEvccVehicleLogoKey,
} from "./model";

const baseState = {
  connectedRawState: "OFF",
  chargingRawState: "OFF",
  modeRawState: "pv",
  vehicleSocRawState: "65 %",
  vehicleRangeRawState: "312 km",
  vehicleNameRawState: "EV6",
  vehicleTitleRawState: "Kia EV6",
  activePhasesRawState: "1",
  chargePowerRawState: "7200 W",
  limitSocRawState: "80 %",
  effectiveLimitSocRawState: "80 %",
  effectivePlanIdRawState: "UNDEF",
  effectivePlanSocRawState: "UNDEF",
  effectivePlanTimeRawState: "UNDEF",
  repeatingPlanActiveRawState: "OFF",
  batteryPowerRawState: "UNDEF",
  batterySocRawState: "UNDEF",
  batteryTitleRawState: "UNDEF",
};

describe("evcc model", () => {
  it("returns disconnected state when no vehicle is connected", () => {
    const state = resolveEvccDisplayState(baseState);

    expect(state.connected).toBe(false);
    expect(state.charging).toBe(false);
    expect(state.hudState).toBe("disconnected");
  });

  it("returns connected idle state for a connected vehicle that is not charging", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
    });

    expect(state.connected).toBe(true);
    expect(state.charging).toBe(false);
    expect(state.hudState).toBe("connected-idle");
    expect(state.vehicleSocDisplay).toBe("65%");
    expect(state.vehicleRangeDisplay).toBe("312 km");
  });

  it("normalizes openHAB dimensionless fraction states for percent values", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      vehicleSocRawState: "0.33041",
      limitSocRawState: "0.8",
      effectiveLimitSocRawState: "1",
    });

    expect(state.vehicleSoc).toBeCloseTo(33.041);
    expect(state.vehicleSocDisplay).toBe("33%");
    expect(state.limitSocDisplay).toBe("80%");
    expect(state.effectiveLimitSocDisplay).toBe("100%");
  });

  it("formats charging power in kW with one decimal without unit for the HUD", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      chargingRawState: "ON",
      chargePowerRawState: "7340 W",
      locale: "de-AT",
    });

    expect(state.hudState).toBe("charging");
    expect(state.chargePowerKw).toBeCloseTo(7.34);
    expect(state.chargePowerHudDisplay).toBe("7,3");
    expect(state.chargePowerDisplay).toBe("7,3 kW");
  });

  it("keeps missing charging power nullable for icon fallback", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      chargingRawState: "ON",
      chargePowerRawState: "UNDEF",
    });

    expect(state.charging).toBe(true);
    expect(state.chargePowerHudDisplay).toBeNull();
  });

  it("normalizes active phase counts", () => {
    const onePhase = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      activePhasesRawState: "1",
    });
    const threePhases = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      activePhasesRawState: "3",
    });

    expect(onePhase.activePhases).toBe(1);
    expect(threePhases.activePhases).toBe(3);
  });

  it("maps EV6 and Enyaq to vehicle logo placeholders", () => {
    expect(resolveEvccVehicleLogoKey("EV6", null)).toBe("kia");
    expect(resolveEvccVehicleLogoKey(null, "Skoda Enyaq")).toBe("skoda");
  });

  it("formats missing effective plan values as no active charging plan", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
    });

    expect(state.effectivePlanStatusDisplay).toBe("Keine Ladeplanung aktiv");
  });

  it("formats effective plan id 0 as one-time plan", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      effectivePlanIdRawState: "0",
      effectivePlanSocRawState: "80 %",
      effectivePlanTimeRawState: "2026-05-01T05:50:00",
      locale: "de-AT",
      now: new Date("2026-04-30T12:00:00"),
    });

    expect(state.effectivePlanStatusDisplay).toBe(
      "Einmalplan: 80% bis morgen 05:50"
    );
  });

  it("formats effective plan ids above 0 as repeating plans", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      effectivePlanIdRawState: "1",
      effectivePlanSocRawState: "50 %",
      effectivePlanTimeRawState: "2026-05-01T05:50:00",
      locale: "de-AT",
      now: new Date("2026-04-30T12:00:00"),
    });

    expect(state.effectivePlanStatusDisplay).toBe(
      "Wiederholender Plan: 50% bis morgen 05:50"
    );
  });

  it("normalizes repeating plan active state", () => {
    expect(
      resolveEvccDisplayState({
        ...baseState,
        repeatingPlanActiveRawState: "ON",
      }).repeatingPlanActive
    ).toBe(true);
    expect(
      resolveEvccDisplayState({
        ...baseState,
        repeatingPlanActiveRawState: "OFF",
      }).repeatingPlanActive
    ).toBe(false);
    expect(
      resolveEvccDisplayState({
        ...baseState,
        repeatingPlanActiveRawState: "UNDEF",
      }).repeatingPlanActive
    ).toBeNull();
  });

  it("detects active house battery charging below -100 W", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      batteryPowerRawState: "-500 W",
      batterySocRawState: "42 %",
      batteryTitleRawState: "byd hvs 7.7",
    });

    expect(state.batteryPowerKw).toBeCloseTo(-0.5);
    expect(state.batteryCharging).toBe(true);
    expect(state.batterySoc).toBe(42);
    expect(state.batterySocDisplay).toBe("42%");
    expect(state.batteryTitle).toBe("byd hvs 7.7");
    expect(state.batteryPowerState).toBe("charging");
    expect(state.batteryPowerStateDisplay).toBe("lädt");
  });

  it("detects active house battery discharging above 100 W", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      batteryPowerRawState: "500 W",
      batterySocRawState: "42 %",
    });

    expect(state.batteryPowerKw).toBeCloseTo(0.5);
    expect(state.batteryCharging).toBe(false);
    expect(state.batteryPowerState).toBe("discharging");
    expect(state.batteryPowerStateDisplay).toBe("entlädt");
  });

  it("does not show house battery activity at or below 100 W absolute", () => {
    for (const rawState of ["-100 W", "-50 W", "0 W", "100 W", "UNDEF"]) {
      const state = resolveEvccDisplayState({
        ...baseState,
        batteryPowerRawState: rawState,
      });

      expect(state.batteryCharging).toBe(false);
      expect(state.batteryPowerState).toBeNull();
      expect(state.batteryPowerStateDisplay).toBeNull();
    }
  });
});
