import type { SceneViewModule } from "../types";
import LivingHud from "./LivingHud";
import LivingOverlay from "./LivingOverlay";

export const LIVING_SCENE_VIEW_MODULE: SceneViewModule = {
  HudComponent: LivingHud,
  OverlayComponent: LivingOverlay,
};
