import { describe, expect, it } from "vitest";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_TEMPERATURE,
} from "../../../domain/openhab-properties";
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

  it("scopes selected sidebar metrics to direct location items", () => {
    const definitions = createLocationPropertySidebarDefinitions(
      "house",
      "Hauer",
      "descendants",
      {
        temperature: "direct",
        humidity: "direct",
        co2: "direct",
        "air-quality": "direct",
      }
    );

    expect(definitions[0]).toMatchObject({
      metricKey: "temperature",
      property: PROPERTY_TEMPERATURE,
      locationScope: "direct",
      measurementRole: "ambient",
    });
    expect(definitions[1]).toMatchObject({
      metricKey: "humidity",
      property: PROPERTY_HUMIDITY,
      locationScope: "direct",
      measurementRole: "ambient",
    });
    expect(definitions[2]).toMatchObject({
      metricKey: "illuminance",
      property: PROPERTY_ILLUMINANCE,
      locationScope: "descendants",
      measurementRole: undefined,
    });
    expect(definitions[3]).toMatchObject({
      metricKey: "co2",
      property: PROPERTY_CO2,
      locationScope: "direct",
      measurementRole: "ambient",
    });
    expect(definitions[4]).toMatchObject({
      metricKey: "air-quality",
      property: PROPERTY_AIR_QUALITY,
      locationScope: "direct",
      measurementRole: "ambient",
    });
  });
});
