import type { ViewConfig, ViewId } from "../types/view";

export const VIEW_IDS: ViewId[] = ["house", "eg", "living"];

export const VIEWS: Record<ViewId, ViewConfig> = {
  house: {
    label: "Haus",
    baseImage: "/views/house/base.webp",
    location: "Hauer",
  },
  eg: {
    label: "EG",
    baseImage: "/views/house/eg/base.webp",
    location: "EG",
  },
  living: {
    label: "Wohnzimmer",
    baseImage: "/views/house/eg/living/base.webp",
    location: "Wohnzimmer",
  },
};
