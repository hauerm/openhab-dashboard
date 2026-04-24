import type { Item, ItemMetadataNamespace } from "../types/item";
import type {
  ControlPosition,
  LightControlDefinition,
  PowerControlDefinition,
  RgbwLightControlDefinition,
  TvControlDefinition,
  VentilationControlDefinition,
} from "../views/controls/controlDefinitions";
import type {
  OpeningControlDefinition,
  OpeningControlSubtype,
} from "../views/controls/controlDefinitions";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_ILLUMINANCE,
  PROPERTY_TEMPERATURE,
} from "./openhab-properties";

const LOCATION_TAGS = new Set([
  "Location",
  "GroundFloor",
  "Basement",
  "Bathroom",
  "Office",
  "Driveway",
  "DiningRoom",
  "Corridor",
  "Garage",
  "Kitchen",
  "Bedroom",
  "BoilerRoom",
  "Terrace",
  "Entry",
  "LaundryRoom",
  "LivingRoom",
]);

const LIGHT_EQUIPMENT_TAGS = new Set([
  "Chandelier",
  "WallLight",
  "Downlight",
  "AccentLight",
  "LightStrip",
]);

const SUPPORTED_EQUIPMENT_TAGS = new Set([
  ...LIGHT_EQUIPMENT_TAGS,
  "Blinds",
  "GarageDoor",
  "PowerOutlet",
  "Television",
  "HVAC",
]);

const AMBIENT_MEASUREMENT_EQUIPMENT_TAGS = new Set([
  "Sensor",
  "AirQualitySensor",
  "WeatherStation",
]);

const TECHNICAL_MEASUREMENT_EQUIPMENT_TAGS = new Set([
  ...SUPPORTED_EQUIPMENT_TAGS,
  "Equipment",
  "Battery",
  "Boiler",
  "Computer",
  "HeatPump",
  "Inverter",
  "NetworkAppliance",
  "Pump",
  "Receiver",
]);

const PROPERTY_TAGS_BY_SEMANTIC_PROPERTY: Record<string, readonly string[]> = {
  [PROPERTY_TEMPERATURE]: ["Temperature"],
  [PROPERTY_HUMIDITY]: ["Humidity"],
  [PROPERTY_ILLUMINANCE]: ["Illuminance"],
  [PROPERTY_CO2]: ["CO2"],
  [PROPERTY_AIR_QUALITY]: ["AQI"],
};

const DEFAULT_LOCATION_IMAGE = "/views/missing.jpg";

export type DiscoveredControlDefinition =
  | LightControlDefinition
  | RgbwLightControlDefinition
  | OpeningControlDefinition
  | PowerControlDefinition
  | TvControlDefinition
  | VentilationControlDefinition;

export interface OpenHABLocationView {
  name: string;
  label: string;
  parentName: string | null;
  tags: readonly string[];
  order: number | null;
  hidden: boolean;
  baseImage: string;
}

export interface UnsupportedEquipment {
  name: string;
  label: string;
  tags: readonly string[];
  locationName: string | null;
}

export interface OpenHABSemanticModel {
  items: readonly Item[];
  itemsByName: ReadonlyMap<string, Item>;
  locations: readonly OpenHABLocationView[];
  locationsByName: ReadonlyMap<string, OpenHABLocationView>;
  rootLocationNames: readonly string[];
  childLocationNamesByParentName: Readonly<Record<string, readonly string[]>>;
  controls: readonly DiscoveredControlDefinition[];
  controlsByLocation: Readonly<Record<string, readonly DiscoveredControlDefinition[]>>;
  trackedItemNames: ReadonlySet<string>;
  unsupportedEquipment: readonly UnsupportedEquipment[];
}

const hasTag = (item: Pick<Item, "tags"> | undefined, tag: string): boolean =>
  Boolean(item?.tags?.includes(tag));

const hasAnyTag = (
  item: Pick<Item, "tags"> | undefined,
  tags: ReadonlySet<string>
): boolean => Boolean(item?.tags?.some((tag) => tags.has(tag)));

const firstGroupName = (item: Pick<Item, "groupNames"> | undefined): string | null =>
  item?.groupNames?.[0] ?? null;

const getMetadataConfig = (
  item: Item,
  namespace: string
): Record<string, unknown> =>
  item.metadata?.[namespace]?.config &&
  typeof item.metadata[namespace].config === "object"
    ? item.metadata[namespace].config
    : {};

const getMetadataString = (
  item: Item,
  namespace: string,
  configKey: string
): string | null => {
  const value = getMetadataConfig(item, namespace)[configKey];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const getMetadataBoolean = (
  item: Item,
  namespace: string,
  configKey: string
): boolean => getMetadataConfig(item, namespace)[configKey] === true;

const getMetadataNumber = (
  item: Item,
  namespace: string,
  configKey: string
): number | null => {
  const value = getMetadataConfig(item, namespace)[configKey];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getSemanticConfigString = (
  item: Item,
  configKey: string
): string | null => {
  const config = item.metadata?.semantics?.config;
  const value =
    config && typeof config === "object"
      ? (config as Record<string, unknown>)[configKey]
      : null;
  return typeof value === "string" && value.trim().length > 0 ? value : null;
};

export const isLocationItem = (item: Item): boolean =>
  item.type === "Group" && hasAnyTag(item, LOCATION_TAGS);

export const itemHasSemanticProperty = (
  item: Item,
  property: string
): boolean => {
  if (getSemanticConfigString(item, "relatesTo") === property) {
    return true;
  }

  const propertyTags = PROPERTY_TAGS_BY_SEMANTIC_PROPERTY[property] ?? [property];
  return propertyTags.some((tag) => hasTag(item, tag));
};

const getLocationPropertyAmbientOverride = (item: Item): boolean | null => {
  const metadata = item.metadata?.["dashboard-location-property"];
  if (!metadata) {
    return null;
  }

  const ambient = metadata.config?.ambient;
  if (typeof ambient === "boolean") {
    return ambient;
  }

  const role =
    typeof metadata.config?.role === "string"
      ? metadata.config.role.toLowerCase()
      : metadata.value.toLowerCase();
  if (role === "ambient" || role === "room") {
    return true;
  }
  if (role === "technical" || role === "device") {
    return false;
  }

  return null;
};

const getAncestorGroupItems = (
  item: Item,
  itemsByName: ReadonlyMap<string, Item>
): Item[] => {
  const groups: Item[] = [];
  const visited = new Set<string>();

  const visit = (groupName: string) => {
    if (visited.has(groupName)) {
      return;
    }
    visited.add(groupName);

    const group = itemsByName.get(groupName);
    if (!group || isLocationItem(group)) {
      return;
    }

    groups.push(group);
    for (const parentGroupName of group.groupNames) {
      visit(parentGroupName);
    }
  };

  for (const groupName of item.groupNames) {
    visit(groupName);
  }

  return groups;
};

export const itemIsAmbientLocationMeasurement = (
  item: Item,
  items: readonly Item[]
): boolean => {
  const itemsByName = new Map(items.map((entry) => [entry.name, entry]));
  const ancestorGroups = getAncestorGroupItems(item, itemsByName);

  for (const candidate of [item, ...ancestorGroups]) {
    const override = getLocationPropertyAmbientOverride(candidate);
    if (override !== null) {
      return override;
    }
  }

  if (ancestorGroups.length === 0) {
    return true;
  }

  if (ancestorGroups.some((group) => hasAnyTag(group, AMBIENT_MEASUREMENT_EQUIPMENT_TAGS))) {
    return true;
  }

  if (ancestorGroups.some((group) => hasAnyTag(group, TECHNICAL_MEASUREMENT_EQUIPMENT_TAGS))) {
    return false;
  }

  return true;
};

const normalizeMetadataNamespace = (
  metadata: ItemMetadataNamespace | undefined
): ItemMetadataNamespace | undefined => {
  if (!metadata) {
    return undefined;
  }
  return {
    value: metadata.value,
    config: metadata.config,
    editable: metadata.editable,
  };
};

export const getItemLocationName = (
  item: Item,
  itemsByName: ReadonlyMap<string, Item>
): string | null => {
  const explicitLocation = getSemanticConfigString(item, "hasLocation");
  if (explicitLocation) {
    return explicitLocation;
  }

  const explicitParentLocation = getSemanticConfigString(item, "isPartOf");
  if (explicitParentLocation && item.type === "Group") {
    return explicitParentLocation;
  }

  const visited = new Set<string>();
  const visit = (itemName: string): string | null => {
    if (visited.has(itemName)) {
      return null;
    }
    visited.add(itemName);

    const current = itemsByName.get(itemName);
    if (!current) {
      return null;
    }
    if (isLocationItem(current)) {
      return current.name;
    }

    for (const groupName of current.groupNames) {
      const locationName = visit(groupName);
      if (locationName) {
        return locationName;
      }
    }
    return null;
  };

  for (const groupName of item.groupNames) {
    const locationName = visit(groupName);
    if (locationName) {
      return locationName;
    }
  }

  return null;
};

export const isLocationDescendant = (
  locationName: string,
  ancestorLocationName: string,
  itemsByName: ReadonlyMap<string, Item>
): boolean => {
  const visited = new Set<string>();
  let currentName: string | null = locationName;

  while (currentName) {
    if (visited.has(currentName)) {
      return false;
    }
    visited.add(currentName);

    const current = itemsByName.get(currentName);
    if (!current) {
      return false;
    }

    const parentName =
      getSemanticConfigString(current, "isPartOf") ?? firstGroupName(current);
    if (parentName === ancestorLocationName) {
      return true;
    }
    currentName = parentName;
  }

  return false;
};

export const itemBelongsToLocation = (
  item: Item,
  targetLocation: string,
  items: readonly Item[],
  locationScope: "direct" | "descendants" = "descendants"
): boolean => {
  const itemsByName = new Map(items.map((entry) => [entry.name, entry]));
  const directLocation = isLocationItem(item)
    ? firstGroupName(item)
    : getItemLocationName(item, itemsByName);

  if (!directLocation) {
    return false;
  }
  if (directLocation === targetLocation) {
    return true;
  }
  if (locationScope === "direct") {
    return false;
  }
  return isLocationDescendant(directLocation, targetLocation, itemsByName);
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createStablePosition = (seed: string): ControlPosition => {
  const hash = hashString(seed);
  const x = 18 + (hash % 68);
  const y = 14 + (Math.floor(hash / 97) % 68);
  return { x, y };
};

const createControlBase = (
  controlType: string,
  equipment: Item,
  locationName: string
) => ({
  controlId: equipment.name,
  controlType,
  label: equipment.label?.trim() || equipment.name,
  layoutMetadataItemNames: [equipment.name],
  defaultPosition: createStablePosition(`${locationName}:${equipment.name}`),
});

const collectItemRefNames = (itemRefs: object): string[] =>
  Array.from(
    new Set(
      Object.values(itemRefs).flatMap((value: unknown) => {
        if (typeof value === "string") {
          return value.trim().length > 0 ? [value] : [];
        }
        if (Array.isArray(value)) {
          return value.filter(
            (entry): entry is string =>
              typeof entry === "string" && entry.trim().length > 0
          );
        }
        return [];
      })
    )
  );

const getAutomationSubtype = (item: Item): OpeningControlSubtype => {
  const automationValue = normalizeMetadataNamespace(item.metadata?.automation)?.value;
  if (
    automationValue === "raffstore" ||
    automationValue === "rollershutter" ||
    automationValue === "garagedoor" ||
    automationValue === "awning"
  ) {
    return automationValue;
  }
  return "opening";
};

const compareByName = (left: Item, right: Item): number =>
  left.name.localeCompare(right.name);

const createControlsForEquipment = (
  equipment: Item,
  children: readonly Item[],
  locationName: string
): DiscoveredControlDefinition[] => {
  if (hasAnyTag(equipment, LIGHT_EQUIPMENT_TAGS)) {
    const colorItem = children
      .filter((item) => item.type === "Color")
      .find((item) => hasTag(item, "Light") || hasTag(item, "Control"));
    if (colorItem) {
      return [
        {
          ...createControlBase("rgbw-light", equipment, locationName),
          controlType: "rgbw-light",
          itemRefs: {
            colorItemName: colorItem.name,
          },
        },
      ];
    }

    const lightItem = children
      .filter((item) => ["Switch", "Dimmer"].includes(item.type))
      .find((item) => hasTag(item, "Light") || hasTag(item, "Control"));
    if (!lightItem) {
      return [];
    }
    return [
      {
        ...createControlBase("light", equipment, locationName),
        controlType: "light",
        interaction: "direct-toggle",
        itemRefs: {
          itemName: lightItem.name,
        },
      },
    ];
  }

  if (hasTag(equipment, "Blinds") || hasTag(equipment, "GarageDoor")) {
    const openingItems = children
      .filter(
        (item) =>
          item.type === "Rollershutter" &&
          hasTag(item, "Control") &&
          hasTag(item, "Opening")
      )
      .sort(compareByName);
    if (openingItems.length === 0) {
      return [];
    }
    const primaryItem = openingItems[0];
    return [
      {
        ...createControlBase("opening", equipment, locationName),
        controlType: "opening",
        subtype: getAutomationSubtype(primaryItem),
        itemRefs: {
          itemName: primaryItem.name,
          itemNames: openingItems.map((item) => item.name),
        },
      },
    ];
  }

  if (hasTag(equipment, "PowerOutlet")) {
    const powerItem = children.find(
      (item) => item.type === "Switch" && hasTag(item, "Power")
    );
    if (!powerItem) {
      return [];
    }
    const consumptionItem = children.find(
      (item) => item.type === "Number:Power" && hasTag(item, "Power")
    );
    return [
      {
        ...createControlBase("power", equipment, locationName),
        controlType: "power",
        itemRefs: {
          powerItemName: powerItem.name,
          consumptionItemName: consumptionItem?.name ?? "",
        },
      },
    ];
  }

  if (hasTag(equipment, "Television")) {
    const powerItem = children.find(
      (item) =>
        item.type === "Switch" &&
        (hasTag(item, "Enabled") || item.name.endsWith("_Power"))
    );
    if (!powerItem) {
      return [];
    }
    const applicationItem = children.find((item) => hasTag(item, "App"));
    const channelNameItem = children.find(
      (item) => item.type === "String" && hasTag(item, "Channel")
    );
    const channelNumberItem = children.find(
      (item) => hasTag(item, "Channel") && hasTag(item, "Control")
    );
    const titleItem = children.find((item) => item.name.endsWith("_Titel"));
    return [
      {
        ...createControlBase("tv", equipment, locationName),
        controlType: "tv",
        itemRefs: {
          powerItemName: powerItem.name,
          applicationItemName: applicationItem?.name ?? "",
          channelNameItemName: channelNameItem?.name ?? "",
          channelNumberItemName: channelNumberItem?.name ?? "",
          titleItemName: titleItem?.name ?? "",
        },
      },
    ];
  }

  if (hasTag(equipment, "HVAC")) {
    const manualModeItem = children.find(
      (item) => hasTag(item, "Manual") && hasTag(item, "Level")
    );
    const actualLevelItem = children.find(
      (item) =>
        hasTag(item, "Status") &&
        hasTag(item, "Level") &&
        item.name.includes("Ist_Stufe")
    );
    if (!manualModeItem || !actualLevelItem) {
      return [];
    }
    return [
      {
        ...createControlBase("ventilation", equipment, locationName),
        controlType: "ventilation",
        itemRefs: {
          manualModeItemName: manualModeItem.name,
          actualLevelItemName: actualLevelItem.name,
        },
      },
    ];
  }

  return [];
};

const getLocationParentName = (
  item: Item,
  itemsByName: ReadonlyMap<string, Item>
): string | null => {
  const explicitParent = getSemanticConfigString(item, "isPartOf");
  if (explicitParent) {
    return explicitParent;
  }

  for (const groupName of item.groupNames) {
    const group = itemsByName.get(groupName);
    if (group && isLocationItem(group)) {
      return group.name;
    }
  }

  return firstGroupName(item);
};

const getLocationTreePath = (
  locationName: string,
  locationsByName: ReadonlyMap<string, OpenHABLocationView>
): string => {
  const visited = new Set<string>();
  const parts: string[] = [];
  let currentName: string | null = locationName;

  while (currentName && !visited.has(currentName)) {
    visited.add(currentName);
    const location = locationsByName.get(currentName);
    if (!location) {
      break;
    }
    parts.unshift(location.label);
    currentName = location.parentName;
  }

  return parts.join("/");
};

const sortLocations = (
  locations: readonly OpenHABLocationView[]
): OpenHABLocationView[] => {
  const byName = new Map(locations.map((location) => [location.name, location]));
  return [...locations].sort((left, right) => {
    if (left.parentName === null && right.parentName !== null) {
      return -1;
    }
    if (right.parentName === null && left.parentName !== null) {
      return 1;
    }
    if (left.order !== null || right.order !== null) {
      return (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER);
    }
    return getLocationTreePath(left.name, byName).localeCompare(
      getLocationTreePath(right.name, byName),
      "de-AT"
    );
  });
};

const buildChildLocationNamesByParentName = (
  locations: readonly OpenHABLocationView[]
): Record<string, readonly string[]> => {
  const byParentName = new Map<string, OpenHABLocationView[]>();

  for (const location of locations) {
    if (!location.parentName) {
      continue;
    }

    const siblings = byParentName.get(location.parentName) ?? [];
    siblings.push(location);
    byParentName.set(location.parentName, siblings);
  }

  return Object.fromEntries(
    Array.from(byParentName.entries()).map(([parentName, siblings]) => [
      parentName,
      siblings
        .sort((left, right) => {
          if (left.order !== null || right.order !== null) {
            const orderDelta =
              (left.order ?? Number.MAX_SAFE_INTEGER) -
              (right.order ?? Number.MAX_SAFE_INTEGER);
            if (orderDelta !== 0) {
              return orderDelta;
            }
          }

          return left.label.localeCompare(right.label, "de-AT");
        })
        .map((location) => location.name),
    ])
  );
};

export const buildOpenHABSemanticModel = (
  items: readonly Item[]
): OpenHABSemanticModel => {
  const itemsByName = new Map(items.map((item) => [item.name, item]));
  const locationItems = items.filter(isLocationItem);
  const locations = sortLocations(
    locationItems.map((item) => ({
      name: item.name,
      label: item.label?.trim() || item.name,
      parentName: getLocationParentName(item, itemsByName),
      tags: item.tags,
      order: getMetadataNumber(item, "dashboard-location", "order"),
      hidden: getMetadataBoolean(item, "dashboard-location", "hidden"),
      baseImage:
        getMetadataString(item, "dashboard-location", "baseImage") ??
        DEFAULT_LOCATION_IMAGE,
    }))
  ).filter((location) => !location.hidden);
  const locationsByName = new Map(locations.map((location) => [location.name, location]));
  const rootLocationNames = locations
    .filter((location) => location.parentName === null)
    .map((location) => location.name);
  const childLocationNamesByParentName = buildChildLocationNamesByParentName(locations);
  const childrenByGroupName = new Map<string, Item[]>();

  for (const item of items) {
    for (const groupName of item.groupNames) {
      const children = childrenByGroupName.get(groupName) ?? [];
      children.push(item);
      childrenByGroupName.set(groupName, children);
    }
  }

  const controls: DiscoveredControlDefinition[] = [];
  const unsupportedEquipment: UnsupportedEquipment[] = [];

  for (const equipment of items) {
    if (equipment.type !== "Group" || isLocationItem(equipment)) {
      continue;
    }

    const locationName = getItemLocationName(equipment, itemsByName);
    if (!locationName || !locationsByName.has(locationName)) {
      continue;
    }

    const children = childrenByGroupName.get(equipment.name) ?? [];
    const equipmentControls = createControlsForEquipment(
      equipment,
      children,
      locationName
    );
    controls.push(...equipmentControls);

    if (equipmentControls.length === 0 && hasAnyTag(equipment, SUPPORTED_EQUIPMENT_TAGS)) {
      unsupportedEquipment.push({
        name: equipment.name,
        label: equipment.label?.trim() || equipment.name,
        tags: equipment.tags,
        locationName,
      });
    }
  }

  const controlsByLocation: Record<string, DiscoveredControlDefinition[]> = {};
  for (const control of controls) {
    const locationName =
      getItemLocationName(itemsByName.get(control.layoutMetadataItemNames[0])!, itemsByName) ??
      "";
    if (!locationName) {
      continue;
    }
    const locationControls = controlsByLocation[locationName] ?? [];
    locationControls.push(control);
    controlsByLocation[locationName] = locationControls;
  }

  const trackedItemNames = new Set<string>();
  for (const control of controls) {
    for (const itemName of collectItemRefNames(control.itemRefs)) {
      trackedItemNames.add(itemName);
    }
  }

  return {
    items,
    itemsByName,
    locations,
    locationsByName,
    rootLocationNames,
    childLocationNamesByParentName,
    controls,
    controlsByLocation,
    trackedItemNames,
    unsupportedEquipment,
  };
};
