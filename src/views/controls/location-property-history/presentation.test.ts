import { describe, expect, it } from "vitest";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_RAIN,
  PROPERTY_TEMPERATURE,
} from "../../../domain/openhab-properties";
import { parseRainState } from "./config";
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
    expect(formatLocationPropertyValue("rain", 1)).toBe("");
    expect(formatLocationPropertyValue("wind", 10.790000000000001)).toBe(
      "10,8 km/h"
    );
    expect(formatLocationPropertyValue("co2", 641)).toBe("641 ppm");
    expect(formatLocationPropertyValue("air-quality", 0)).toBe("Gesund");
  });

  it("maps rain switch and numeric states to active numeric values", () => {
    expect(parseRainState("ON")).toBe(1);
    expect(parseRainState("1")).toBe(1);
    expect(parseRainState("0.2")).toBe(1);
    expect(parseRainState("OFF")).toBe(0);
    expect(parseRainState("0")).toBe(0);
    expect(parseRainState("NULL")).toBeNull();
    expect(parseRainState("UNDEF")).toBeNull();
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
      block: "border-scale-temp-comfort-emphasis bg-scale-temp-comfort-surface",
      iconContainer: "bg-scale-temp-comfort-emphasis",
      icon: "text-scale-temp-comfort-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_TEMPERATURE, 29)).toEqual({
      block: "border-scale-temp-hot-emphasis bg-scale-temp-hot-surface",
      iconContainer: "bg-scale-temp-hot-emphasis",
      icon: "text-scale-temp-hot-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_HUMIDITY, 20)).toEqual({
      block: "border-scale-humidity-dry-emphasis bg-scale-humidity-dry-surface",
      iconContainer: "bg-scale-humidity-dry-emphasis",
      icon: "text-scale-humidity-dry-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_CO2, 1500)).toEqual({
      block: "border-scale-risk-bad-emphasis bg-scale-risk-bad-surface",
      iconContainer: "bg-scale-risk-bad-emphasis",
      icon: "text-scale-risk-bad-foreground",
    });
    expect(resolveLocationPropertyTint(PROPERTY_AIR_QUALITY, 1)).toEqual({
      block: "border-scale-risk-good-emphasis bg-scale-risk-good-surface",
      iconContainer: "bg-scale-risk-good-emphasis",
      icon: "text-scale-risk-good-foreground",
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
    expect(resolveLocationPropertyTint(PROPERTY_RAIN, 1)).toEqual({
      block: "border-rain-active-emphasis bg-rain-active-surface",
      iconContainer: "bg-rain-active-emphasis",
      icon: "text-rain-active-foreground",
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
