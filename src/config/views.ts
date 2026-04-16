import type { ViewConfig, ViewId } from "../types/view";

export const VIEW_IDS: ViewId[] = ["house", "eg", "living"];

export const VIEWS: Record<ViewId, ViewConfig> = {
  house: {
    label: "Hauer",
    baseImage: "/views/house/base.webp",
    location: "Hauer",
    locationScope: "direct",
  },
  eg: {
    label: "EG",
    baseImage: "/views/house/eg/base.webp",
    location: "EG",
    locationScope: "descendants",
  },
  living: {
    label: "Wohnzimmer",
    baseImage: "/views/house/eg/living/base.webp",
    location: "Wohnzimmer",
    locationScope: "descendants",
  },
};
