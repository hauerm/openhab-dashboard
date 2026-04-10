import type { SceneViewModule } from "../../types";
import EgHud from "./EgHud";
import EgOverlay from "./EgOverlay";

export const EG_SCENE_VIEW_MODULE: SceneViewModule = {
  HudComponent: EgHud,
  OverlayComponent: EgOverlay,
};

