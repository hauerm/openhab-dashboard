import { describe, expect, it } from "vitest";
import {
  resolveTvAppLogoKey,
  resolveTvDisplayState,
} from "./model";

describe("tv model", () => {
  it("returns off state without content when tv is not powered on", () => {
    expect(
      resolveTvDisplayState("OFF", "Netflix", "ORF 1", "1", "ZIB")
    ).toMatchObject({
      isOn: false,
      displayMode: "off",
      smallLine: null,
      largeLine: null,
      appLogoKey: null,
    });
  });

  it("formats a channel and title combination for live tv", () => {
    expect(
      resolveTvDisplayState("ON", "NULL", "ORF 1", "1", "ZIB")
    ).toMatchObject({
      isOn: true,
      displayMode: "program",
      smallLine: "1 ORF 1",
      largeLine: "ZIB",
      appLogoKey: null,
    });
  });

  it("maps known source apps to logo keys", () => {
    expect(resolveTvAppLogoKey("Netflix")).toBe("netflix");
    expect(resolveTvAppLogoKey("Prime Video")).toBe("prime-video");
    expect(resolveTvAppLogoKey("Amazon Prime Video")).toBe("prime-video");
  });

  it("falls back to app text when there is no logo asset", () => {
    expect(
      resolveTvDisplayState("ON", "Disney+", "UNDEF", "UNDEF", "UNDEF")
    ).toMatchObject({
      isOn: true,
      displayMode: "app-text",
      largeLine: "Disney+",
      appLogoKey: null,
    });
  });

  it("treats empty and invalid text states as missing", () => {
    expect(
      resolveTvDisplayState("ON", "  ", "-", "NULL", "UNDEF")
    ).toMatchObject({
      isOn: true,
      displayMode: "fallback",
      largeLine: "Läuft",
    });
  });
});
