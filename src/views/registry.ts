import type { ViewId } from "../types/view";
import type { ViewModule } from "./types";
import { EG_VIEW_MODULE } from "./house/eg";
import { HOUSE_VIEW_MODULE } from "./house";
import { LIVING_VIEW_MODULE } from "./house/eg/living";

export const VIEW_MODULES: Record<ViewId, ViewModule> = {
  house: HOUSE_VIEW_MODULE,
  eg: EG_VIEW_MODULE,
  living: LIVING_VIEW_MODULE,
};
