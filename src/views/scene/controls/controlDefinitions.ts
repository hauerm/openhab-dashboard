export interface SceneControlPosition {
  x: number;
  y: number;
}

export type SceneControlItemRefs = object;

interface SceneControlDefinitionBase<
  TControlType extends string,
  TItemRefs,
> {
  controlId: string;
  controlType: TControlType;
  label: string;
  itemRefs: TItemRefs;
  layoutMetadataItemNames: readonly string[];
  defaultPosition: SceneControlPosition;
}

export interface SceneMetricControlItemRefs {
  primaryItemName?: string;
  secondaryItemName?: string;
  tertiaryItemName?: string;
}

export interface SceneMetricControlDefinition
  extends SceneControlDefinitionBase<"scene-metric", SceneMetricControlItemRefs> {
  metricKey: "house-temperature" | "house-weather" | "house-night-status";
}

export interface LightControlItemRefs {
  itemName: string;
}

export interface LightControlDefinition
  extends SceneControlDefinitionBase<"light", LightControlItemRefs> {
  interaction: "overlay" | "direct-toggle";
}

export interface RaffstoreControlItemRefs {
  itemName: string;
}

export type RaffstoreControlDefinition = SceneControlDefinitionBase<
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

export type TvControlDefinition = SceneControlDefinitionBase<
  "tv",
  TvControlItemRefs
>;

export interface LocationPropertyHistoryControlDefinition
  extends SceneControlDefinitionBase<"location-property-history", Record<string, never>> {
  metricKey: "temperature" | "humidity" | "co2" | "air-quality";
  property: string;
  location?: string;
  title: string;
  comfortBand?: {
    min: number;
    max: number;
    label?: string;
  };
}

export type VentilationControlDefinition = SceneControlDefinitionBase<
  "ventilation",
  Record<string, never>
>;

export type SceneControlDefinition =
  | SceneMetricControlDefinition
  | LightControlDefinition
  | RaffstoreControlDefinition
  | TvControlDefinition
  | LocationPropertyHistoryControlDefinition
  | VentilationControlDefinition;

export type SceneControlType = SceneControlDefinition["controlType"];

const collectItemRefNames = (itemRefs: SceneControlItemRefs): string[] =>
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
  definitions: readonly SceneControlDefinition[]
): readonly string[] =>
  Array.from(
    new Set(definitions.flatMap((definition) => collectItemRefNames(definition.itemRefs)))
  );
