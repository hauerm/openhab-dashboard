import { describe, expect, it } from "vitest";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "../../../domain/openhab-properties";
import {
  formatLocationPropertyValue,
  resolveLocationPropertyTint,
} from "./presentation";

describe("location-property-history presentation", () => {
  it("formats location property values for hud display", () => {
    expect(formatLocationPropertyValue("temperature", 22.4)).toBe("22,4 °C");
    expect(formatLocationPropertyValue("humidity", 48.3)).toBe("48%");
    expect(formatLocationPropertyValue("co2", 641)).toBe("641 ppm");
    expect(formatLocationPropertyValue("air-quality", 0)).toBe("Gesund");
  });

  it("maps tint bands from control config", () => {
    expect(resolveLocationPropertyTint(PROPERTY_TEMPERATURE, 22)).toEqual({
      block: "border-status-good-emphasis bg-status-good-surface",
      iconContainer: "bg-status-good-emphasis",
      icon: "text-status-good-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_TEMPERATURE, 29)).toEqual({
      block: "border-status-critical-emphasis bg-status-critical-surface",
      iconContainer: "bg-status-critical-emphasis",
      icon: "text-status-critical-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_HUMIDITY, 20)).toEqual({
      block: "border-status-moderate-emphasis bg-status-moderate-surface",
      iconContainer: "bg-status-moderate-emphasis",
      icon: "text-status-moderate-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_CO2, 1500)).toEqual({
      block: "border-status-critical-emphasis bg-status-critical-surface",
      iconContainer: "bg-status-critical-emphasis",
      icon: "text-status-critical-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_AIR_QUALITY, 1)).toEqual({
      block: "border-status-good-emphasis bg-status-good-surface",
      iconContainer: "bg-status-good-emphasis",
      icon: "text-status-good-foreground",
    });
  });
});
