import {
  Astro_Sun_Data_Sonnenphase,
  KNX_Wetterstation_Aussentemperatur,
  KNX_Wetterstation_Helligkeit,
  KNX_Wetterstation_Regen,
} from "openhab-hauer-items/items";

export const HOUSE_VIEW_TRACKED_ITEM_NAMES = [
  KNX_Wetterstation_Aussentemperatur,
  KNX_Wetterstation_Regen,
  KNX_Wetterstation_Helligkeit,
  Astro_Sun_Data_Sonnenphase,
] as const;

