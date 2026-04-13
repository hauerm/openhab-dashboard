import { useMemo } from "react";
import { useViewStore } from "../../../stores/viewStore";
import type { ViewMetricControlDefinition } from "../controlDefinitions";
import {
  formatHouseTemperature,
  formatNightStatus,
} from "./presentation";

export const useViewMetricControlValue = (
  definition: ViewMetricControlDefinition
): string => {
  const itemStates = useViewStore((state) => state.itemStates);

  return useMemo(() => {
    switch (definition.metricKey) {
      case "house-temperature":
        return formatHouseTemperature(
          definition.itemRefs.primaryItemName
            ? itemStates[definition.itemRefs.primaryItemName]?.rawState
            : undefined
        );
      case "house-night-status":
        return formatNightStatus(
          definition.itemRefs.primaryItemName
            ? itemStates[definition.itemRefs.primaryItemName]?.rawState
            : undefined
        );
    }
  }, [definition, itemStates]);
};
