import { describe, expect, it } from "vitest";
import {
  resolvePowerConsumptionDisplay,
  resolvePowerControlDisplayState,
} from "./model";

describe("power control model", () => {
  it("resolves on/off state from the power item", () => {
    expect(resolvePowerControlDisplayState("ON", "24 W")).toEqual({
      isOn: true,
      consumptionDisplay: "24 W",
    });
    expect(resolvePowerControlDisplayState("OFF", "0 W")).toEqual({
      isOn: false,
      consumptionDisplay: "0 W",
    });
    expect(resolvePowerControlDisplayState("NULL", "NULL")).toEqual({
      isOn: false,
      consumptionDisplay: null,
    });
  });

  it("formats current consumption values in watts", () => {
    expect(resolvePowerConsumptionDisplay("24.3 W", "de-AT")).toBe("24,3 W");
    expect(resolvePowerConsumptionDisplay("4.25 W", "de-AT")).toBe("4,3 W");
    expect(resolvePowerConsumptionDisplay("0,2 W", "de-AT")).toBe("0,2 W");
    expect(resolvePowerConsumptionDisplay("1.2 kW", "de-AT")).toBe("1,2 kW");
    expect(resolvePowerConsumptionDisplay("UNDEF", "de-AT")).toBeNull();
  });
});
