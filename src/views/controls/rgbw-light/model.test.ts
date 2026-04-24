import { describe, expect, it } from "vitest";
import {
  createToggleColor,
  hsbToCommand,
  parseHsbState,
} from "./model";

describe("rgbw light model", () => {
  it("parses openHAB HSB color states", () => {
    expect(parseHsbState("210,80,40")).toEqual({
      hue: 210,
      saturation: 80,
      brightness: 40,
    });
    expect(parseHsbState("361,120,-5")).toEqual({
      hue: 360,
      saturation: 100,
      brightness: 0,
    });
  });

  it("uses fallback values for unavailable states", () => {
    expect(parseHsbState("UNDEF")).toEqual({
      hue: 45,
      saturation: 80,
      brightness: 0,
    });
    expect(parseHsbState("NULL")).toEqual({
      hue: 45,
      saturation: 80,
      brightness: 0,
    });
  });

  it("creates complete HSB commands for toggle and channel changes", () => {
    expect(hsbToCommand(createToggleColor(parseHsbState("210,80,40")))).toBe(
      "210,80,0"
    );
    expect(hsbToCommand(createToggleColor(parseHsbState("210,80,0")))).toBe(
      "210,80,100"
    );
    expect(hsbToCommand({ ...parseHsbState("210,80,40"), hue: 120 })).toBe(
      "120,80,40"
    );
    expect(
      hsbToCommand({ ...parseHsbState("210,80,40"), saturation: 50 })
    ).toBe("210,50,40");
    expect(
      hsbToCommand({ ...parseHsbState("210,80,40"), brightness: 65 })
    ).toBe("210,80,65");
  });
});
