import { describe, expect, it } from "vitest";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_TEMPERATURE,
} from "../../../domain/openhab-properties";
import {
  formatLocationPropertyValue,
  resolveIlluminancePresentation,
  resolveIlluminanceVisualState,
  resolveLocationPropertyTint,
} from "./presentation";

describe("location-property-history presentation", () => {
  it("formats location property values for hud display", () => {
    expect(formatLocationPropertyValue("temperature", 22.4)).toBe("22,4 °C");
    expect(formatLocationPropertyValue("humidity", 48.3)).toBe("48%");
    expect(formatLocationPropertyValue("illuminance", 1800.2)).toBe("1.800 lx");
    expect(formatLocationPropertyValue("co2", 641)).toBe("641 ppm");
    expect(formatLocationPropertyValue("air-quality", 0)).toBe("Gesund");
  });

  it("maps illuminance lux ranges to semantic states", () => {
    expect(resolveIlluminanceVisualState(null)).toBeNull();
    expect(resolveIlluminanceVisualState(0)).toBe("night");
    expect(resolveIlluminanceVisualState(9)).toBe("night");
    expect(resolveIlluminanceVisualState(10)).toBe("dim");
    expect(resolveIlluminanceVisualState(399)).toBe("dim");
    expect(resolveIlluminanceVisualState(400)).toBe("soft");
    expect(resolveIlluminanceVisualState(4_999)).toBe("soft");
    expect(resolveIlluminanceVisualState(5_000)).toBe("bright");
    expect(resolveIlluminanceVisualState(19_999)).toBe("bright");
    expect(resolveIlluminanceVisualState(20_000)).toBe("sunny");
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
    expect(resolveLocationPropertyTint(PROPERTY_ILLUMINANCE, 0)).toEqual({
      block: "border-illuminance-night-emphasis bg-illuminance-night-surface",
      iconContainer: "bg-illuminance-night-emphasis",
      icon: "text-illuminance-night-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_ILLUMINANCE, 10)).toEqual({
      block: "border-illuminance-dim-emphasis bg-illuminance-dim-surface",
      iconContainer: "bg-illuminance-dim-emphasis",
      icon: "text-illuminance-dim-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_ILLUMINANCE, 400)).toEqual({
      block: "border-illuminance-soft-emphasis bg-illuminance-soft-surface",
      iconContainer: "bg-illuminance-soft-emphasis",
      icon: "text-illuminance-soft-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_ILLUMINANCE, 5_000)).toEqual({
      block: "border-illuminance-bright-emphasis bg-illuminance-bright-surface",
      iconContainer: "bg-illuminance-bright-emphasis",
      icon: "text-illuminance-bright-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_ILLUMINANCE, 20_000)).toEqual({
      block: "border-illuminance-sunny-emphasis bg-illuminance-sunny-surface",
      iconContainer: "bg-illuminance-sunny-emphasis",
      icon: "text-illuminance-sunny-foreground",
    });
  });

  it("returns illuminance icon presentation for sidebar display", () => {
    expect(resolveIlluminancePresentation(null)).toBeNull();
    expect(resolveIlluminancePresentation(1_800)).toMatchObject({
      state: "soft",
      label: "Soft",
      tint: {
        block: "border-illuminance-soft-emphasis bg-illuminance-soft-surface",
        iconContainer: "bg-illuminance-soft-emphasis",
        icon: "text-illuminance-soft-foreground",
      },
    });
  });
});
