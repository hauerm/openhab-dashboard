import test from "node:test";
import assert from "node:assert/strict";
import { items as ITEMS } from "openhab-hauer-items/items";
import { ITEM_META } from "openhab-hauer-items/generated-items";

test("critical weather item constant is available", () => {
  assert.equal(
    ITEMS.KNX_Wetterstation_Aussentemperatur,
    "KNX_Wetterstation_Aussentemperatur"
  );
});

test("critical weather item has metadata entry", () => {
  assert.ok(ITEM_META.KNX_Wetterstation_Aussentemperatur);
});

test("granular ESM exports provide Helios runtime item constants", async () => {
  const { KNX_Helios_ManualMode, KNX_Helios_KWRL_Ist_Stufe } = await import(
    "openhab-hauer-items/items"
  );

  assert.equal(KNX_Helios_ManualMode, "KNX_Helios_ManualMode");
  assert.equal(KNX_Helios_KWRL_Ist_Stufe, "KNX_Helios_KWRL_Ist_Stufe");
});
