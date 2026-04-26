import { describe, expect, it } from "vitest";
import { parseDimmerState } from "./model";

describe("light control model", () => {
  it("parses dimmer on/off and invalid states", () => {
    expect(parseDimmerState("ON")).toEqual({ isOn: true, brightness: 100 });
    expect(parseDimmerState("OFF")).toEqual({ isOn: false, brightness: 0 });
    expect(parseDimmerState("NULL")).toEqual({ isOn: false, brightness: 0 });
    expect(parseDimmerState("UNDEF")).toEqual({ isOn: false, brightness: 0 });
    expect(parseDimmerState("-")).toEqual({ isOn: false, brightness: 0 });
    expect(parseDimmerState(undefined)).toEqual({ isOn: false, brightness: 0 });
  });

  it("parses and clamps numeric dimmer states", () => {
    expect(parseDimmerState("35")).toEqual({ isOn: true, brightness: 35 });
    expect(parseDimmerState("35.6")).toEqual({ isOn: true, brightness: 36 });
    expect(parseDimmerState("35,4 %")).toEqual({ isOn: true, brightness: 35 });
    expect(parseDimmerState("-4")).toEqual({ isOn: false, brightness: 0 });
    expect(parseDimmerState("120")).toEqual({ isOn: true, brightness: 100 });
    expect(parseDimmerState("0")).toEqual({ isOn: false, brightness: 0 });
  });
});
