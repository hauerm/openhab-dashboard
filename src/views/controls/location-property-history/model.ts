import { useEffect, useMemo } from "react";
import { createLocationPropertyHistoryStore } from "../../../stores/locationPropertyHistoryStore";
import type { LocationPropertyHistoryControlDefinition } from "../controlDefinitions";
import {
  LOCATION_PROPERTY_CONTROL_CONFIGS,
} from "./config";
import {
  formatLocationPropertyValue,
  resolveIlluminancePresentation,
  resolveLocationPropertyTint,
} from "./presentation";

const toSortedArray = (itemNames: Set<string>): string[] =>
  Array.from(itemNames).sort((left, right) => left.localeCompare(right));

const useLocationPropertyHistoryStoreHook = (
  definition: LocationPropertyHistoryControlDefinition
) => {
  const resolvedConfig = LOCATION_PROPERTY_CONTROL_CONFIGS[definition.property];
  const locationKey = definition.location?.trim() || "__all__";
  const locationScope = definition.locationScope ?? "descendants";
  const measurementRole = definition.measurementRole ?? "__all__";
  const scopeKey = `${locationKey}::${locationScope}::${measurementRole}`;

  return useMemo(
    () => createLocationPropertyHistoryStore(resolvedConfig, scopeKey),
    [resolvedConfig, scopeKey]
  );
};

const formatValue = (
  metricKey: LocationPropertyHistoryControlDefinition["metricKey"],
  value: number | null
): string => formatLocationPropertyValue(metricKey, value);

export const useLocationPropertyHistoryLayoutMetadataItemNames = (
  definition: LocationPropertyHistoryControlDefinition
): readonly string[] => {
  const useStore = useLocationPropertyHistoryStoreHook(definition);
  const itemNames = useStore((state) => state.itemNames);

  return useMemo(() => toSortedArray(itemNames), [itemNames]);
};

export const useLocationPropertyHistoryControlModel = (
  definition: LocationPropertyHistoryControlDefinition
) => {
  const useStore = useLocationPropertyHistoryStoreHook(definition);
  const initialize = useStore((state) => state.initialize);
  const currentValue = useStore((state) => state.currentValue);
  const itemCount = useStore((state) => state.itemNames.size);

  useEffect(() => {
    void initialize(
      definition.location,
      definition.locationScope,
      definition.measurementRole
    );
  }, [
    definition.location,
    definition.locationScope,
    definition.measurementRole,
    initialize,
  ]);

  return useMemo(() => {
    const resolvedConfig = LOCATION_PROPERTY_CONTROL_CONFIGS[definition.property];
    const illuminancePresentation =
      definition.metricKey === "illuminance"
        ? resolveIlluminancePresentation(currentValue)
        : null;

    return {
      icon: resolvedConfig.icon,
      unit: resolvedConfig.unit,
      hasItems: itemCount > 0,
      isVisibleInSidebar:
        resolvedConfig.isVisibleInSidebar?.(currentValue) ?? true,
      value: formatValue(definition.metricKey, currentValue),
      tint:
        illuminancePresentation?.tint ??
        resolveLocationPropertyTint(definition.property, currentValue),
      illuminancePresentation,
    };
  }, [currentValue, definition.metricKey, definition.property, itemCount]);
};

export const useLocationPropertyHistoryControlStore = (
  definition: LocationPropertyHistoryControlDefinition
) => {
  const useStore = useLocationPropertyHistoryStoreHook(definition);
  const initialize = useStore((state) => state.initialize);

  useEffect(() => {
    void initialize(
      definition.location,
      definition.locationScope,
      definition.measurementRole
    );
  }, [
    definition.location,
    definition.locationScope,
    definition.measurementRole,
    initialize,
  ]);

  return useStore;
};
