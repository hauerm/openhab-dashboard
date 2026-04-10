import { useEffect, useMemo } from "react";
import { createSemanticStore } from "../../../../stores/semanticStore";
import { useVentilationStore } from "../../../../stores/ventilationStore";
import { SEMANTIC_CONFIGS } from "../../../../config/semanticTypes";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "../../../../services/config";
import {
  formatEgCo2Value,
  formatEgHealthStatus,
  formatEgHumidityValue,
  formatEgTemperatureValue,
  formatVentilationBadge,
  resolveEgCo2Tint,
  resolveEgHealthTint,
  resolveEgHumidityTint,
  resolveEgTemperatureTint,
} from "./egHud.formatters";

const EG_SCOPE_KEY = "EG";

export interface EgHudMetric {
  id: "temp" | "humidity" | "co2" | "health";
  label: string;
  value: string;
  tint: { container: string; icon: string };
}

export interface EgViewStoreState {
  metrics: EgHudMetric[];
  ventilationBadge: string;
}

export const useEgViewStore = (): EgViewStoreState => {
  const tempStore = useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_TEMPERATURE], EG_SCOPE_KEY),
    []
  );
  const humidityStore = useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_HUMIDITY], EG_SCOPE_KEY),
    []
  );
  const co2Store = useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_CO2], EG_SCOPE_KEY),
    []
  );
  const healthStore = useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_AIR_QUALITY], EG_SCOPE_KEY),
    []
  );

  const initializeTemp = tempStore((state) => state.initialize);
  const initializeHumidity = humidityStore((state) => state.initialize);
  const initializeCo2 = co2Store((state) => state.initialize);
  const initializeHealth = healthStore((state) => state.initialize);

  useEffect(() => {
    void Promise.all([
      initializeTemp(EG_SCOPE_KEY),
      initializeHumidity(EG_SCOPE_KEY),
      initializeCo2(EG_SCOPE_KEY),
      initializeHealth(EG_SCOPE_KEY),
    ]);
  }, [initializeCo2, initializeHealth, initializeHumidity, initializeTemp]);

  const tempValue = tempStore((state) => state.currentValue);
  const humidityValue = humidityStore((state) => state.currentValue);
  const co2Value = co2Store((state) => state.currentValue);
  const healthValue = healthStore((state) => state.currentValue);

  const ventilationInitialize = useVentilationStore((state) => state.initialize);
  const manualLevel = useVentilationStore((state) => state.manualLevel);
  const actualLevel = useVentilationStore((state) => state.actualLevel);

  useEffect(() => {
    void ventilationInitialize();
  }, [ventilationInitialize]);

  return useMemo(
    () => ({
      metrics: [
        {
          id: "temp",
          label: "Temperatur",
          value: formatEgTemperatureValue(tempValue),
          tint: resolveEgTemperatureTint(tempValue),
        },
        {
          id: "humidity",
          label: "Luftfeuchtigkeit",
          value: formatEgHumidityValue(humidityValue),
          tint: resolveEgHumidityTint(humidityValue),
        },
        {
          id: "co2",
          label: "CO₂",
          value: formatEgCo2Value(co2Value),
          tint: resolveEgCo2Tint(co2Value),
        },
        {
          id: "health",
          label: "Luftqualität",
          value: formatEgHealthStatus(healthValue),
          tint: resolveEgHealthTint(healthValue),
        },
      ],
      ventilationBadge: formatVentilationBadge(manualLevel, actualLevel),
    }),
    [actualLevel, co2Value, healthValue, humidityValue, manualLevel, tempValue]
  );
};

