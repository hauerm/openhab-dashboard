import { describe, expect, it } from "vitest";
import {
  formatEgCo2Value,
  formatEgHealthStatus,
  formatEgHumidityValue,
  formatEgTemperatureValue,
  formatVentilationBadge,
  formatVentilationDecorator,
  resolveEgCo2Tint,
  resolveEgHealthTint,
  resolveEgHumidityTint,
  resolveEgTemperatureTint,
} from "./egHud.formatters";

describe("eg hud formatters", () => {
  it("formats eg values as large text tokens", () => {
    expect(formatEgTemperatureValue(22.4)).toBe("22,4 °C");
    expect(formatEgHumidityValue(48.3)).toBe("48%");
    expect(formatEgCo2Value(641)).toBe("641 ppm");
    expect(formatEgHealthStatus(0)).toBe("Gesund");
  });

  it("formats ventilation labels", () => {
    expect(formatVentilationDecorator(-1, 2)).toBe("Auto (Stufe 2)");
    expect(formatVentilationDecorator(3, 2)).toBe("Manual (Stufe 3)");
    expect(formatVentilationBadge(-1, 1)).toBe("A1");
    expect(formatVentilationBadge(1, 3)).toBe("M1");
  });

  it("maps tints from backgroundTintBands", () => {
    expect(resolveEgTemperatureTint(22)).toEqual({
      container: "bg-emerald-500/30",
      icon: "text-emerald-100",
    });
    expect(resolveEgTemperatureTint(29)).toEqual({
      container: "bg-rose-500/30",
      icon: "text-rose-100",
    });

    expect(resolveEgHumidityTint(20)).toEqual({
      container: "bg-amber-500/30",
      icon: "text-amber-100",
    });
    expect(resolveEgCo2Tint(1500)).toEqual({
      container: "bg-rose-500/30",
      icon: "text-rose-100",
    });
    expect(resolveEgHealthTint(1)).toEqual({
      container: "bg-emerald-500/30",
      icon: "text-emerald-100",
    });
  });
});
