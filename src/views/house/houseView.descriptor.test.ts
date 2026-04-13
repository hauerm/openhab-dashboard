import { describe, expect, it, vi } from "vitest";

vi.mock("../../domain/hauer-items", () => ({
  Astro_Sun_Data_Sonnenphase: "Astro_Sun_Data_Sonnenphase",
  KNX_Wetterstation_Aussentemperatur: "KNX_Wetterstation_Aussentemperatur",
}));

import { HOUSE_VIEW_CONTROL_DEFINITIONS } from "./houseView.descriptor";

describe("HOUSE_VIEW_CONTROL_DEFINITIONS", () => {
  it("keeps only the remaining house metric cards", () => {
    expect(HOUSE_VIEW_CONTROL_DEFINITIONS.map((definition) => definition.controlId)).toEqual([
      "house-metric-outside-temperature",
      "house-metric-night-status",
    ]);
  });
});
