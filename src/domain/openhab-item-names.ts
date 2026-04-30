export const KNX_Wetterstation_Regen = "KNX_Wetterstation_Regen" as const;
export const KNX_Wetterstation_Windgeschwindigkeit =
  "KNX_Wetterstation_Windgeschwindigkeit" as const;
export const KNX_Wetterstation_Helligkeit =
  "KNX_Wetterstation_Helligkeit" as const;

export const KNX_JA1_Raffstore_Wohnzimmer =
  "KNX_JA1_Raffstore_Wohnzimmer" as const;
export const KNX_JA1_Raffstore_Wohnzimmer_Strasse =
  "KNX_JA1_Raffstore_Wohnzimmer_Strasse" as const;

export const SAH3_Licht_Couch = "SAH3_Licht_Couch" as const;
export const SAH3_Licht_TV = "SAH3_Licht_TV" as const;

export const Samsung_TV_Wohnzimmer_Power =
  "Samsung_TV_Wohnzimmer_Power" as const;
export const Samsung_TV_Wohnzimmer_Application =
  "Samsung_TV_Wohnzimmer_Application" as const;
export const Samsung_TV_Wohnzimmer_Kanal =
  "Samsung_TV_Wohnzimmer_Kanal" as const;
export const Samsung_TV_Wohnzimmer_Kanalnummer =
  "Samsung_TV_Wohnzimmer_Kanalnummer" as const;
export const Samsung_TV_Wohnzimmer_Titel =
  "Samsung_TV_Wohnzimmer_Titel" as const;

export const Shelly_Plug_Wohnzimmer_Betrieb =
  "Shelly_Plug_Wohnzimmer_Betrieb" as const;
export const Shelly_Plug_Wohnzimmer_Stromverbrauch =
  "Shelly_Plug_Wohnzimmer_Stromverbrauch" as const;

export const KNX_Helios_ManualMode = "KNX_Helios_ManualMode" as const;
export const KNX_Helios_KWRL_Ist_Stufe =
  "KNX_Helios_KWRL_Ist_Stufe" as const;

export const OPENHAB_ITEM_NAMES = {
  KNX_Wetterstation_Regen,
  KNX_Wetterstation_Windgeschwindigkeit,
  KNX_Wetterstation_Helligkeit,
  KNX_JA1_Raffstore_Wohnzimmer,
  KNX_JA1_Raffstore_Wohnzimmer_Strasse,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
  Samsung_TV_Wohnzimmer_Power,
  Samsung_TV_Wohnzimmer_Application,
  Samsung_TV_Wohnzimmer_Kanal,
  Samsung_TV_Wohnzimmer_Kanalnummer,
  Samsung_TV_Wohnzimmer_Titel,
  Shelly_Plug_Wohnzimmer_Betrieb,
  Shelly_Plug_Wohnzimmer_Stromverbrauch,
  KNX_Helios_ManualMode,
  KNX_Helios_KWRL_Ist_Stufe,
} as const;

export type OpenHABItemName =
  (typeof OPENHAB_ITEM_NAMES)[keyof typeof OPENHAB_ITEM_NAMES];
