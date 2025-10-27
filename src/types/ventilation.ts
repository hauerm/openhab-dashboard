import { Point } from "./generated-items";

export type HeliosManualLevel = -1 | 0 | 1 | 2 | 3 | 4;

export const HELIOS_MANUAL_MODE_ITEM = Point.Setpoint.KNX_Helios_ManualMode;

export const HELIOS_MANUAL_LEVEL_LABELS: Record<HeliosManualLevel, string> = {
  [-1]: "Automatik",
  0: "Aus",
  1: "Stufe 1",
  2: "Stufe 2",
  3: "Stufe 3",
  4: "Max",
};
