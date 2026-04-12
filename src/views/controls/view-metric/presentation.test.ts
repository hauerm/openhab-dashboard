import { describe, expect, it } from "vitest";
import {
  formatHouseTemperature,
  formatNightStatus,
  formatWeatherStatus,
} from "./presentation";

describe("view-metric presentation", () => {
  it("formats outdoor temperature", () => {
    expect(formatHouseTemperature("21.45 °C")).toBe("21.4 °C");
    expect(formatHouseTemperature("UNDEF")).toBe("--");
  });

  it("formats weather status with rain as primary signal", () => {
    expect(formatWeatherStatus("ON", "15000")).toBe("Regen");
    expect(formatWeatherStatus("OFF", "500")).toBe("Trocken (dunkel)");
    expect(formatWeatherStatus("OFF", "4000")).toBe("Trocken");
  });

  it("formats day/night status", () => {
    expect(formatNightStatus("NIGHT")).toBe("Nacht");
    expect(formatNightStatus("DAY")).toBe("Tag");
    expect(formatNightStatus(undefined)).toBe("--");
  });
});
