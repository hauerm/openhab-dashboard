import { describe, expect, it } from "vitest";
import { PROPERTY_ILLUMINANCE } from "../../../domain/openhab-properties";
import { createLocationPropertySidebarDefinitions } from "./sidebarDefinitions";

describe("createLocationPropertySidebarDefinitions", () => {
  it("includes illuminance in the sidebar metric definitions", () => {
    const definitions = createLocationPropertySidebarDefinitions(
      "house",
      "Hauer"
    );

    expect(definitions.map((definition) => definition.metricKey)).toEqual([
      "temperature",
      "humidity",
      "illuminance",
      "co2",
      "air-quality",
    ]);

    expect(definitions[2]).toMatchObject({
      metricKey: "illuminance",
      property: PROPERTY_ILLUMINANCE,
      label: "Helligkeit",
      title: "Helligkeit Hauer",
    });
  });
});
