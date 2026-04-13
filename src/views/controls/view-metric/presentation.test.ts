import { describe, expect, it } from "vitest";
import {
  formatHouseTemperature,
  formatNightStatus,
} from "./presentation";

describe("view-metric presentation", () => {
  it("formats outdoor temperature", () => {
    expect(formatHouseTemperature("21.45 °C")).toBe("21.4 °C");
    expect(formatHouseTemperature("UNDEF")).toBe("--");
  });

  it("formats day/night status", () => {
    expect(formatNightStatus("NIGHT")).toBe("Nacht");
    expect(formatNightStatus("DAY")).toBe("Tag");
    expect(formatNightStatus(undefined)).toBe("--");
  });
});
