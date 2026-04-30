import { describe, expect, it } from "vitest";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_RAIN,
  PROPERTY_TEMPERATURE,
  PROPERTY_WIND,
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
      "rain",
      "wind",
      "co2",
      "air-quality",
    ]);

    expect(definitions[2]).toMatchObject({
      metricKey: "illuminance",
      property: PROPERTY_ILLUMINANCE,
      label: "Helligkeit",
      title: "Helligkeit Hauer",
    });
    expect(definitions[3]).toMatchObject({
      metricKey: "rain",
      property: PROPERTY_RAIN,
      label: "Regen",
      title: "Regen Hauer",
    });
    expect(definitions[4]).toMatchObject({
      metricKey: "wind",
      property: PROPERTY_WIND,
      label: "Wind",
      title: "Wind Hauer",
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
        rain: "direct",
        wind: "direct",
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
      metricKey: "rain",
      property: PROPERTY_RAIN,
      locationScope: "direct",
      measurementRole: undefined,
    });
    expect(definitions[4]).toMatchObject({
      metricKey: "wind",
      property: PROPERTY_WIND,
      locationScope: "direct",
      measurementRole: undefined,
    });
    expect(definitions[5]).toMatchObject({
      metricKey: "co2",
      property: PROPERTY_CO2,
      locationScope: "direct",
      measurementRole: "ambient",
    });
    expect(definitions[6]).toMatchObject({
      metricKey: "air-quality",
      property: PROPERTY_AIR_QUALITY,
      locationScope: "direct",
      measurementRole: "ambient",
    });
  });
});
