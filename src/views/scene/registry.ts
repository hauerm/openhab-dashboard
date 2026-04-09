import type { ViewId } from "../../types/scene";
import type { SceneViewModule } from "./types";
import { EG_SCENE_VIEW_MODULE } from "./eg";
import { HOUSE_SCENE_VIEW_MODULE } from "./house";

export const SCENE_VIEW_MODULES: Record<ViewId, SceneViewModule> = {
  house: HOUSE_SCENE_VIEW_MODULE,
  eg: EG_SCENE_VIEW_MODULE,
};

