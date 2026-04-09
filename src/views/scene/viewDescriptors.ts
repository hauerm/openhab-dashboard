import type { ViewId } from "../../types/scene";
import { EG_VIEW_TRACKED_ITEM_NAMES } from "./eg/egView.descriptor";
import { HOUSE_VIEW_TRACKED_ITEM_NAMES } from "./house/houseView.descriptor";

export const SCENE_VIEW_TRACKED_ITEM_NAMES: Record<ViewId, readonly string[]> = {
  house: HOUSE_VIEW_TRACKED_ITEM_NAMES,
  eg: EG_VIEW_TRACKED_ITEM_NAMES,
};

