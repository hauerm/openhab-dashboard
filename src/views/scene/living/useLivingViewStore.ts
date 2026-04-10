import { useMemo } from "react";
import { useSceneStoreCore } from "../../../stores/sceneStoreCore";
import {
  KNX_JA1_Raffstore_Wohnzimmer,
  KNX_JA1_Raffstore_Wohnzimmer_Strasse,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
} from "openhab-hauer-items/items";

interface LivingRaffstoreControlState {
  id: "wohnzimmer" | "strasse";
  label: string;
  itemName: string;
  openingRawState: string | undefined;
}

interface LivingLightControlState {
  id: "couch" | "tv";
  label: string;
  itemName: string;
  rawState: string | undefined;
}

interface LivingViewState {
  raffstores: LivingRaffstoreControlState[];
  lights: LivingLightControlState[];
}

export const useLivingViewStore = (): LivingViewState => {
  const itemStates = useSceneStoreCore((state) => state.itemStates);

  return useMemo(
    () => ({
      raffstores: [
        {
          id: "wohnzimmer",
          label: "Raffstore Innen",
          itemName: KNX_JA1_Raffstore_Wohnzimmer,
          openingRawState: itemStates[KNX_JA1_Raffstore_Wohnzimmer]?.rawState,
        },
        {
          id: "strasse",
          label: "Raffstore Straße",
          itemName: KNX_JA1_Raffstore_Wohnzimmer_Strasse,
          openingRawState:
            itemStates[KNX_JA1_Raffstore_Wohnzimmer_Strasse]?.rawState,
        },
      ],
      lights: [
        {
          id: "couch",
          label: "Licht Couch",
          itemName: SAH3_Licht_Couch,
          rawState: itemStates[SAH3_Licht_Couch]?.rawState,
        },
        {
          id: "tv",
          label: "Licht TV",
          itemName: SAH3_Licht_TV,
          rawState: itemStates[SAH3_Licht_TV]?.rawState,
        },
      ],
    }),
    [itemStates]
  );
};
