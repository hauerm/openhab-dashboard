import type {
  LocationPropertyMeasurementRole,
  LocationScope,
} from "../../types/view";

export interface ControlPosition {
  x: number;
  y: number;
}

export type ControlItemRefs = object;

interface ControlDefinitionBase<
  TControlType extends string,
  TItemRefs,
> {
  controlId: string;
  controlType: TControlType;
  label: string;
  itemRefs: TItemRefs;
  layoutMetadataItemNames: readonly string[];
  defaultPosition: ControlPosition;
}

export interface LightControlItemRefs {
  itemName: string;
}

export interface LightControlDefinition
  extends ControlDefinitionBase<"light", LightControlItemRefs> {
  interaction: "overlay" | "direct-toggle";
}

export type DimmerControlDefinition = ControlDefinitionBase<
  "dimmer",
  LightControlItemRefs
>;

export interface RgbwLightControlItemRefs {
  colorItemName: string;
}

export type RgbwLightControlDefinition = ControlDefinitionBase<
  "rgbw-light",
  RgbwLightControlItemRefs
>;

export type OpeningControlSubtype =
  | "raffstore"
  | "rollershutter"
  | "garagedoor"
  | "awning"
  | "opening";

export interface OpeningControlItemRefs {
  itemName: string;
  itemNames: readonly string[];
}

export type OpeningControlDefinition = ControlDefinitionBase<
  "opening",
  OpeningControlItemRefs
> & {
  subtype: OpeningControlSubtype;
};

export type RaffstoreControlDefinition = OpeningControlDefinition;

export interface TvControlItemRefs {
  powerItemName: string;
  applicationItemName: string;
  channelNameItemName: string;
  channelNumberItemName: string;
  titleItemName: string;
}

export type TvControlDefinition = ControlDefinitionBase<
  "tv",
  TvControlItemRefs
>;

export interface PowerControlItemRefs {
  powerItemName: string;
  consumptionItemName: string;
}

export type PowerControlDefinition = ControlDefinitionBase<
  "power",
  PowerControlItemRefs
>;

export interface LocationPropertyHistoryControlDefinition
  extends ControlDefinitionBase<"location-property-history", Record<string, never>> {
  metricKey: "temperature" | "humidity" | "illuminance" | "co2" | "air-quality";
  property: string;
  location?: string;
  locationScope?: LocationScope;
  measurementRole?: LocationPropertyMeasurementRole;
  title: string;
  comfortBand?: {
    min: number;
    max: number;
    label?: string;
  };
}

export interface VentilationControlItemRefs {
  manualModeItemName: string;
  actualLevelItemName: string;
}

export type VentilationControlDefinition = ControlDefinitionBase<
  "ventilation",
  VentilationControlItemRefs
>;

export type ViewControlDefinition =
  | LightControlDefinition
  | DimmerControlDefinition
  | RgbwLightControlDefinition
  | OpeningControlDefinition
  | TvControlDefinition
  | PowerControlDefinition
  | LocationPropertyHistoryControlDefinition
  | VentilationControlDefinition;

export type ViewControlType = ViewControlDefinition["controlType"];

const collectItemRefNames = (itemRefs: ControlItemRefs): string[] =>
  Object.values(itemRefs as Record<string, unknown>).flatMap((value) => {
    if (typeof value === "string") {
      return value.trim().length > 0 ? [value] : [];
    }
    if (Array.isArray(value)) {
      return value.filter(
        (entry): entry is string => typeof entry === "string" && entry.trim().length > 0
      );
    }
    return [];
  });

export const collectTrackedItemNamesFromControlDefinitions = (
  definitions: readonly ViewControlDefinition[]
): readonly string[] =>
  Array.from(
    new Set(definitions.flatMap((definition) => collectItemRefNames(definition.itemRefs)))
  );
