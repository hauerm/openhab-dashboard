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
});
