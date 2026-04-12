import {
  KNX_JA1_Raffstore_Wohnzimmer,
  KNX_JA1_Raffstore_Wohnzimmer_Strasse,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
  Samsung_TV_Wohnzimmer_Application,
  Samsung_TV_Wohnzimmer_Kanal,
  Samsung_TV_Wohnzimmer_Kanalnummer,
  Samsung_TV_Wohnzimmer_Power,
  Samsung_TV_Wohnzimmer_Titel,
} from "../../../../../domain/hauer-items";
import {
  type LightControlDefinition,
  type RaffstoreControlDefinition,
  type TvControlDefinition,
  collectTrackedItemNamesFromControlDefinitions,
} from "../../../controls/controlDefinitions";

export const LIVING_VIEW_CONTROL_DEFINITIONS: readonly (
  | RaffstoreControlDefinition
  | LightControlDefinition
  | TvControlDefinition
)[] = [
  {
    controlId: KNX_JA1_Raffstore_Wohnzimmer,
    controlType: "raffstore",
    label: "Raffstore Innen",
    itemRefs: {
      itemName: KNX_JA1_Raffstore_Wohnzimmer,
    },
    layoutMetadataItemNames: [KNX_JA1_Raffstore_Wohnzimmer],
    defaultPosition: { x: 22, y: 22 },
  },
  {
    controlId: KNX_JA1_Raffstore_Wohnzimmer_Strasse,
    controlType: "raffstore",
    label: "Raffstore Straße",
    itemRefs: {
      itemName: KNX_JA1_Raffstore_Wohnzimmer_Strasse,
    },
    layoutMetadataItemNames: [KNX_JA1_Raffstore_Wohnzimmer_Strasse],
    defaultPosition: { x: 40, y: 22 },
  },
  {
    controlId: SAH3_Licht_Couch,
    controlType: "light",
    label: "Licht Couch",
    interaction: "direct-toggle",
    itemRefs: {
      itemName: SAH3_Licht_Couch,
    },
    layoutMetadataItemNames: [SAH3_Licht_Couch],
    defaultPosition: { x: 75, y: 74 },
  },
  {
    controlId: SAH3_Licht_TV,
    controlType: "light",
    label: "Licht TV",
    interaction: "direct-toggle",
    itemRefs: {
      itemName: SAH3_Licht_TV,
    },
    layoutMetadataItemNames: [SAH3_Licht_TV],
    defaultPosition: { x: 90, y: 74 },
  },
  {
    controlId: Samsung_TV_Wohnzimmer_Power,
    controlType: "tv",
    label: "TV",
    itemRefs: {
      powerItemName: Samsung_TV_Wohnzimmer_Power,
      applicationItemName: Samsung_TV_Wohnzimmer_Application,
      channelNameItemName: Samsung_TV_Wohnzimmer_Kanal,
      channelNumberItemName: Samsung_TV_Wohnzimmer_Kanalnummer,
      titleItemName: Samsung_TV_Wohnzimmer_Titel,
    },
    layoutMetadataItemNames: [Samsung_TV_Wohnzimmer_Power],
    defaultPosition: { x: 85, y: 44 },
  },
] as const;

export const LIVING_VIEW_TRACKED_ITEM_NAMES =
  collectTrackedItemNamesFromControlDefinitions(LIVING_VIEW_CONTROL_DEFINITIONS);
