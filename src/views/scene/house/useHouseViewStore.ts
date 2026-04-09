import { useMemo } from "react";
import { useSceneStoreCore } from "../../../stores/sceneStoreCore";
import {
  Astro_Sun_Data_Sonnenphase,
  KNX_Wetterstation_Aussentemperatur,
  KNX_Wetterstation_Helligkeit,
  KNX_Wetterstation_Regen,
} from "openhab-hauer-items/items";
import {
  formatHouseTemperature,
  formatNightStatus,
  formatWeatherStatus,
} from "./houseHud.formatters";

export interface HouseHudMetric {
  id: "outside-temperature" | "weather" | "night-status";
  label: string;
  value: string;
  position: { top: string; left: string };
}

export const useHouseViewStore = (): { metrics: HouseHudMetric[] } => {
  const itemStates = useSceneStoreCore((state) => state.itemStates);

  return useMemo(() => {
    const outsideRaw = itemStates[KNX_Wetterstation_Aussentemperatur]?.rawState;
    const rainRaw = itemStates[KNX_Wetterstation_Regen]?.rawState;
    const brightnessRaw = itemStates[KNX_Wetterstation_Helligkeit]?.rawState;
    const nightRaw = itemStates[Astro_Sun_Data_Sonnenphase]?.rawState;

    return {
      metrics: [
        {
          id: "outside-temperature",
          label: "Außen",
          value: formatHouseTemperature(outsideRaw),
          position: { top: "10%", left: "11%" },
        },
        {
          id: "weather",
          label: "Wetter",
          value: formatWeatherStatus(rainRaw, brightnessRaw),
          position: { top: "20%", left: "11%" },
        },
        {
          id: "night-status",
          label: "Status",
          value: formatNightStatus(nightRaw),
          position: { top: "30%", left: "11%" },
        },
      ],
    };
  }, [itemStates]);
};

