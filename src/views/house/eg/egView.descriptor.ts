import {
  type VentilationControlDefinition,
  collectTrackedItemNamesFromControlDefinitions,
} from "../../controls/controlDefinitions";

export const EG_VIEW_CONTROL_DEFINITIONS: readonly VentilationControlDefinition[] = [
  {
    controlId: "eg-ventilation",
    controlType: "ventilation",
    label: "Lüftung",
    itemRefs: {},
    layoutMetadataItemNames: [],
    defaultPosition: { x: 88, y: 14 },
  },
] as const;

export const EG_VIEW_TRACKED_ITEM_NAMES =
  collectTrackedItemNamesFromControlDefinitions(EG_VIEW_CONTROL_DEFINITIONS);
