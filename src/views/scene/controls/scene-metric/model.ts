import { useMemo } from "react";
import { useSceneStoreCore } from "../../../../stores/sceneStoreCore";
import type { SceneMetricControlDefinition } from "../controlDefinitions";
import {
  formatHouseTemperature,
  formatNightStatus,
  formatWeatherStatus,
} from "../../house/houseHud.formatters";

export const useSceneMetricControlValue = (
  definition: SceneMetricControlDefinition
): string => {
  const itemStates = useSceneStoreCore((state) => state.itemStates);

  return useMemo(() => {
    switch (definition.metricKey) {
      case "house-temperature":
        return formatHouseTemperature(
          definition.itemRefs.primaryItemName
            ? itemStates[definition.itemRefs.primaryItemName]?.rawState
            : undefined
        );
      case "house-weather":
        return formatWeatherStatus(
          definition.itemRefs.primaryItemName
            ? itemStates[definition.itemRefs.primaryItemName]?.rawState
            : undefined,
          definition.itemRefs.secondaryItemName
            ? itemStates[definition.itemRefs.secondaryItemName]?.rawState
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
