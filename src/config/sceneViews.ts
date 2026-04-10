import type { SceneViewConfig, ViewId } from "../types/scene";

export const SCENE_VIEW_IDS: ViewId[] = ["house", "eg", "living"];

export const SCENE_VIEWS: Record<ViewId, SceneViewConfig> = {
  house: {
    label: "Haus",
    baseImage: "/scenes/house/base.webp",
  },
  eg: {
    label: "EG",
    baseImage: "/scenes/house/eg/base.webp",
  },
  living: {
    label: "Wohnzimmer",
    baseImage: "/scenes/house/eg/living/base.webp",
  },
};
