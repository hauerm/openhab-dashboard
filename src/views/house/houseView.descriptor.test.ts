import { describe, expect, it } from "vitest";
import { HOUSE_VIEW_TRACKED_ITEM_NAMES } from "./houseView.descriptor";

describe("HOUSE_VIEW_TRACKED_ITEM_NAMES", () => {
  it("does not track house-only metric cards", () => {
    expect(HOUSE_VIEW_TRACKED_ITEM_NAMES).toEqual([]);
  });
});
