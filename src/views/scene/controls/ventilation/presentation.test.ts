import { describe, expect, it } from "vitest";
import {
  formatVentilationBadge,
  formatVentilationDecorator,
} from "./presentation";

describe("ventilation presentation", () => {
  it("formats ventilation labels", () => {
    expect(formatVentilationDecorator(-1, 2)).toBe("Auto (Stufe 2)");
    expect(formatVentilationDecorator(3, 2)).toBe("Manual (Stufe 3)");
    expect(formatVentilationBadge(-1, 1)).toBe("A1");
    expect(formatVentilationBadge(1, 3)).toBe("M1");
  });
});
