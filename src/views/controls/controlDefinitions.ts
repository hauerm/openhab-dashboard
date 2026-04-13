import type { LocationScope } from "../../types/view";

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

export interface ViewMetricControlItemRefs {
  primaryItemName?: string;
  secondaryItemName?: string;
  tertiaryItemName?: string;
}

export interface ViewMetricControlDefinition
  extends ControlDefinitionBase<"view-metric", ViewMetricControlItemRefs> {
  metricKey: "house-temperature" | "house-weather" | "house-night-status";
}

export interface LightControlItemRefs {
  itemName: string;
}

export interface LightControlDefinition
  extends ControlDefinitionBase<"light", LightControlItemRefs> {
  interaction: "overlay" | "direct-toggle";
}

export interface RaffstoreControlItemRefs {
  itemName: string;
}

export type RaffstoreControlDefinition = ControlDefinitionBase<
  "raffstore",
  RaffstoreControlItemRefs
>;

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

export interface LocationPropertyHistoryControlDefinition
  extends ControlDefinitionBase<"location-property-history", Record<string, never>> {
  metricKey: "temperature" | "humidity" | "co2" | "air-quality";
  property: string;
  location?: string;
  locationScope?: LocationScope;
  title: string;
  comfortBand?: {
    min: number;
    max: number;
    label?: string;
  };
}

export type VentilationControlDefinition = ControlDefinitionBase<
  "ventilation",
  Record<string, never>
>;

export type ViewControlDefinition =
  | ViewMetricControlDefinition
  | LightControlDefinition
  | RaffstoreControlDefinition
  | TvControlDefinition
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
