import { useEffect, useMemo } from "react";
import { createLocationPropertyHistoryStore } from "../../../../stores/locationPropertyHistoryStore";
import type { LocationPropertyHistoryControlDefinition } from "../controlDefinitions";
import {
  LOCATION_PROPERTY_CONTROL_CONFIGS,
} from "./config";
import {
  formatLocationPropertyValue,
  resolveLocationPropertyTint,
} from "./presentation";

const toSortedArray = (itemNames: Set<string>): string[] =>
  Array.from(itemNames).sort((left, right) => left.localeCompare(right));

const useLocationPropertyHistoryStoreHook = (
  definition: LocationPropertyHistoryControlDefinition
) => {
  const resolvedConfig = LOCATION_PROPERTY_CONTROL_CONFIGS[definition.property];
  const scopeKey = definition.location?.trim() || "__all__";

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

  useEffect(() => {
    void initialize(definition.location);
  }, [definition.location, initialize]);

  return useMemo(() => {
    const resolvedConfig = LOCATION_PROPERTY_CONTROL_CONFIGS[definition.property];

    return {
      icon: resolvedConfig.icon,
      unit: resolvedConfig.unit,
      value: formatValue(definition.metricKey, currentValue),
      tint: resolveLocationPropertyTint(definition.property, currentValue),
    };
  }, [currentValue, definition.metricKey, definition.property]);
};

export const useLocationPropertyHistoryControlStore = (
  definition: LocationPropertyHistoryControlDefinition
) => {
  const useStore = useLocationPropertyHistoryStoreHook(definition);
  const initialize = useStore((state) => state.initialize);

  useEffect(() => {
    void initialize(definition.location);
  }, [definition.location, initialize]);

  return useStore;
};
