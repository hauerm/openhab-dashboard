import { describe, expect, it } from "vitest";
import { PROPERTY_TEMPERATURE } from "../domain/openhab-properties";
import { ItemService } from "./item-service";
import type { Item } from "../types/item";

const createItem = (
  name: string,
  type: Item["type"],
  semanticsConfig: Record<string, unknown>,
  relatesTo?: string
): Item => ({
  link: `/items/${name}`,
  state: "0",
  editable: false,
  type,
  name,
  tags: [],
  groupNames: [],
  metadata: {
    semantics: {
      value: type === "Group" ? "Location" : "Measurement",
      config: {
        ...semanticsConfig,
        ...(relatesTo ? { relatesTo } : {}),
      },
    },
  },
});

describe("ItemService.filterItems location scoping", () => {
  const items: Item[] = [
    createItem("Hauer", "Group", {}),
    createItem("EG", "Group", { isPartOf: "Hauer" }),
    createItem("Wohnzimmer", "Group", { isPartOf: "EG" }),
    createItem(
      "Aussentemperatur",
      "Number:Temperature",
      { hasLocation: "Hauer" },
      PROPERTY_TEMPERATURE
    ),
    createItem(
      "Wohnzimmer_Temperatur",
      "Number:Temperature",
      { hasLocation: "Wohnzimmer" },
      PROPERTY_TEMPERATURE
    ),
  ];

  it("includes descendant locations by default", () => {
    const filtered = ItemService.filterItems(items, {
      property: PROPERTY_TEMPERATURE,
      location: "Hauer",
    });

    expect(filtered.map((item) => item.name)).toEqual([
      "Aussentemperatur",
      "Wohnzimmer_Temperatur",
    ]);
  });

  it("can restrict location filtering to direct properties only", () => {
    const filtered = ItemService.filterItems(items, {
      property: PROPERTY_TEMPERATURE,
      location: "Hauer",
      locationScope: "direct",
    });

    expect(filtered.map((item) => item.name)).toEqual(["Aussentemperatur"]);
  });

  it("does not include nested group hierarchy items when filtering direct properties", () => {
    const groupedItems: Item[] = [
      createItem("Hauer", "Group", {}),
      {
        ...createItem("EG", "Group", {}),
        groupNames: ["Hauer"],
      },
      {
        ...createItem("Wohnzimmer", "Group", {}),
        groupNames: ["EG"],
      },
      {
        ...createItem("Healthy_Home_Coach", "Group", {}),
        groupNames: ["Wohnzimmer"],
      },
      {
        ...createItem(
          "Healthy_Home_Coach_Temperatur",
          "Number:Temperature",
          {},
          PROPERTY_TEMPERATURE
        ),
        groupNames: ["Healthy_Home_Coach"],
      },
    ];

    const filtered = ItemService.filterItems(groupedItems, {
      property: PROPERTY_TEMPERATURE,
      location: "Hauer",
      locationScope: "direct",
    });

    expect(filtered.map((item) => item.name)).toEqual([]);
  });

  it("filters ambient location measurements separately from technical equipment measurements", () => {
    const technicalTemperature = {
      ...createItem(
        "Shelly_Plug_Temperature",
        "Number:Temperature",
        { hasLocation: "Wohnzimmer" },
        PROPERTY_TEMPERATURE
      ),
      groupNames: ["Shelly_Plug"],
    };
    const roomSensorTemperature = {
      ...createItem(
        "Room_Sensor_Temperature",
        "Number:Temperature",
        { hasLocation: "Wohnzimmer" },
        PROPERTY_TEMPERATURE
      ),
      groupNames: ["Room_Sensor"],
    };
    const directRoomTemperature = createItem(
      "Wall_Temperature",
      "Number:Temperature",
      { hasLocation: "Wohnzimmer" },
      PROPERTY_TEMPERATURE
    );
    const ambientItems: Item[] = [
      createItem("Wohnzimmer", "Group", {}),
      {
        ...createItem("Shelly_Plug", "Group", {}),
        tags: ["PowerOutlet"],
        groupNames: ["Wohnzimmer"],
      },
      {
        ...createItem("Room_Sensor", "Group", {}),
        tags: ["Sensor"],
        groupNames: ["Wohnzimmer"],
      },
      technicalTemperature,
      roomSensorTemperature,
      directRoomTemperature,
    ];

    const filtered = ItemService.filterItems(ambientItems, {
      property: PROPERTY_TEMPERATURE,
      location: "Wohnzimmer",
      locationScope: "direct",
      measurementRole: "ambient",
    });

    expect(filtered.map((item) => item.name)).toEqual([
      "Room_Sensor_Temperature",
      "Wall_Temperature",
    ]);
  });

  it("allows dashboard-location-property metadata to override ambient measurement detection", () => {
    const ambientItems: Item[] = [
      createItem("Wohnzimmer", "Group", {}),
      {
        ...createItem("Shelly_Plug", "Group", {}),
        tags: ["PowerOutlet"],
        groupNames: ["Wohnzimmer"],
      },
      {
        ...createItem(
          "Shelly_Plug_Temperature",
          "Number:Temperature",
          { hasLocation: "Wohnzimmer" },
          PROPERTY_TEMPERATURE
        ),
        groupNames: ["Shelly_Plug"],
        metadata: {
          ...createItem(
            "Shelly_Plug_Temperature",
            "Number:Temperature",
            { hasLocation: "Wohnzimmer" },
            PROPERTY_TEMPERATURE
          ).metadata,
          "dashboard-location-property": {
            value: "ambient",
          },
        },
      },
    ];

    const filtered = ItemService.filterItems(ambientItems, {
      property: PROPERTY_TEMPERATURE,
      location: "Wohnzimmer",
      locationScope: "direct",
      measurementRole: "ambient",
    });

    expect(filtered.map((item) => item.name)).toEqual([
      "Shelly_Plug_Temperature",
    ]);
  });
});
