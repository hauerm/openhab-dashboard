import { describe, expect, it } from "vitest";
import { OPENHAB_ITEM_NAMES } from "./openhab-item-names";

describe("OPENHAB_ITEM_NAMES", () => {
  it("documents non-empty direct item references", () => {
    expect(Object.values(OPENHAB_ITEM_NAMES).every((name) => name.length > 0)).toBe(
      true
    );
  });

  it("does not contain duplicate item names", () => {
    const itemNames = Object.values(OPENHAB_ITEM_NAMES);
    expect(new Set(itemNames).size).toBe(itemNames.length);
  });
});
