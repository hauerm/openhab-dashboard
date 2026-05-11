import type { ViewControlDefinition } from "../controls/controlDefinitions";

export type OverviewGroupKey =
  | "lights"
  | "raffstore"
  | "rollershutter"
  | "awning"
  | "power"
  | "tv"
  | "ventilation"
  | "evcc"
  | "doors"
  | "other";

export type AggregateCapability = "lights" | "raffstore" | "rollershutter" | "power";
export type OverviewExpandedLayout = "icon-grid" | "detail-list";

export interface OverviewControlMetadata {
  overviewGroup: OverviewGroupKey;
  aggregateCapability: AggregateCapability | null;
  aggregateEnabled: boolean;
}

export interface OverviewGroupDefinition {
  groupKey: OverviewGroupKey;
  label: string;
  sortOrder: number;
  expandedLayout: OverviewExpandedLayout;
}

export const OVERVIEW_GROUPS: readonly OverviewGroupDefinition[] = [
  { groupKey: "lights", label: "Licht", sortOrder: 10, expandedLayout: "icon-grid" },
  {
    groupKey: "raffstore",
    label: "Raffstores",
    sortOrder: 20,
    expandedLayout: "icon-grid",
  },
  {
    groupKey: "rollershutter",
    label: "Rollläden",
    sortOrder: 30,
    expandedLayout: "icon-grid",
  },
  { groupKey: "awning", label: "Markise", sortOrder: 40, expandedLayout: "icon-grid" },
  {
    groupKey: "ventilation",
    label: "Lüftung",
    sortOrder: 50,
    expandedLayout: "icon-grid",
  },
  { groupKey: "tv", label: "TV", sortOrder: 60, expandedLayout: "detail-list" },
  {
    groupKey: "power",
    label: "Steckdosen",
    sortOrder: 70,
    expandedLayout: "detail-list",
  },
  { groupKey: "evcc", label: "Laden", sortOrder: 80, expandedLayout: "detail-list" },
  { groupKey: "doors", label: "Tore", sortOrder: 90, expandedLayout: "icon-grid" },
  { groupKey: "other", label: "Sonstiges", sortOrder: 100, expandedLayout: "icon-grid" },
] as const;

const GROUP_BY_KEY = new Map(
  OVERVIEW_GROUPS.map((definition) => [definition.groupKey, definition])
);

export const getOverviewGroupDefinition = (
  groupKey: OverviewGroupKey
): OverviewGroupDefinition =>
  GROUP_BY_KEY.get(groupKey) ?? GROUP_BY_KEY.get("other")!;

export const getOverviewControlMetadata = (
  definition: ViewControlDefinition
): OverviewControlMetadata => {
  if (
    definition.controlType === "light" ||
    definition.controlType === "dimmer" ||
    definition.controlType === "rgbw-light"
  ) {
    return {
      overviewGroup: "lights",
      aggregateCapability: "lights",
      aggregateEnabled: true,
    };
  }

  if (definition.controlType === "opening") {
    if (definition.subtype === "raffstore") {
      return {
        overviewGroup: "raffstore",
        aggregateCapability: "raffstore",
        aggregateEnabled: true,
      };
    }
    if (definition.subtype === "rollershutter") {
      return {
        overviewGroup: "rollershutter",
        aggregateCapability: "rollershutter",
        aggregateEnabled: true,
      };
    }
    if (definition.subtype === "awning") {
      return {
        overviewGroup: "awning",
        aggregateCapability: null,
        aggregateEnabled: false,
      };
    }
    if (definition.subtype === "garagedoor") {
      return {
        overviewGroup: "doors",
        aggregateCapability: null,
        aggregateEnabled: false,
      };
    }
    return {
      overviewGroup: "other",
      aggregateCapability: null,
      aggregateEnabled: false,
    };
  }

  if (definition.controlType === "power") {
    return {
      overviewGroup: "power",
      aggregateCapability: "power",
      aggregateEnabled: true,
    };
  }

  if (definition.controlType === "tv") {
    return {
      overviewGroup: "tv",
      aggregateCapability: null,
      aggregateEnabled: false,
    };
  }

  if (definition.controlType === "ventilation") {
    return {
      overviewGroup: "ventilation",
      aggregateCapability: null,
      aggregateEnabled: false,
    };
  }

  if (definition.controlType === "evcc") {
    return {
      overviewGroup: "evcc",
      aggregateCapability: null,
      aggregateEnabled: false,
    };
  }

  return {
    overviewGroup: "other",
    aggregateCapability: null,
    aggregateEnabled: false,
  };
};
