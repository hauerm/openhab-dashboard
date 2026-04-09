import type { SceneViewModule } from "../types";
import HouseHud from "./HouseHud";
import HouseOverlay from "./HouseOverlay";

export const HOUSE_SCENE_VIEW_MODULE: SceneViewModule = {
  HudComponent: HouseHud,
  OverlayComponent: HouseOverlay,
};

