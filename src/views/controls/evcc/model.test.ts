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

  it("formats charging power in kW with one decimal without unit for the HUD", () => {
    const state = resolveEvccDisplayState({
      ...baseState,
      connectedRawState: "ON",
      chargingRawState: "ON",
      chargePowerRawState: "7340 W",
    });

    expect(state.hudState).toBe("charging");
    expect(state.chargePowerKw).toBeCloseTo(7.34);
    expect(state.chargePowerHudDisplay).toBe("7.3");
    expect(state.chargePowerDisplay).toBe("7.3 kW");
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
});
