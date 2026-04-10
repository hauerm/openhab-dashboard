import type { ViewId } from "../../types/scene";
import { EG_VIEW_TRACKED_ITEM_NAMES } from "./house/eg/egView.descriptor";
import { HOUSE_VIEW_TRACKED_ITEM_NAMES } from "./house/houseView.descriptor";
import { LIVING_VIEW_TRACKED_ITEM_NAMES } from "./house/eg/living/livingView.descriptor";

export const SCENE_VIEW_TRACKED_ITEM_NAMES: Record<ViewId, readonly string[]> = {
  house: HOUSE_VIEW_TRACKED_ITEM_NAMES,
  eg: EG_VIEW_TRACKED_ITEM_NAMES,
  living: LIVING_VIEW_TRACKED_ITEM_NAMES,
};
