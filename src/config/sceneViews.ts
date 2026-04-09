import {
  KNX_SAH2_Licht_Einfahrt,
  KNX_SAH2_Licht_Eingang,
  KNX_SAH2_Licht_Terrasse_Saulen,
  KNX_SAH2_Licht_Terrasse_Wand,
  SAH1_Stromerkennung_Licht_Esstisch,
  SAH1_Stromerkennung_Licht_Speis,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
  SHA1_Stromerkennung_Licht_Kuche,
} from "openhab-hauer-items/items";
import type { SceneViewConfig, ViewId } from "../types/scene";

export const SCENE_VIEW_IDS: ViewId[] = ["house", "eg"];

export const SCENE_VIEWS: Record<ViewId, SceneViewConfig> = {
  house: {
    label: "Haus",
    baseImage: "/scenes/house/base.jpg",
    sceneImages: {
      "light:on": "/scenes/house/light-on.jpg",
      "light:off": "/scenes/house/light-off.jpg",
    },
    sceneItems: [
      KNX_SAH2_Licht_Einfahrt,
      KNX_SAH2_Licht_Eingang,
      KNX_SAH2_Licht_Terrasse_Wand,
      KNX_SAH2_Licht_Terrasse_Saulen,
    ],
  },
  eg: {
    label: "EG",
    baseImage: "/scenes/eg/base.jpg",
    sceneImages: {
      "light:on": "/scenes/eg/light-on.jpg",
      "light:off": "/scenes/eg/light-off.jpg",
    },
    sceneItems: [
      SHA1_Stromerkennung_Licht_Kuche,
      SAH1_Stromerkennung_Licht_Esstisch,
      SAH1_Stromerkennung_Licht_Speis,
      SAH3_Licht_Couch,
      SAH3_Licht_TV,
    ],
  },
};
