import type { ComponentType } from "react";

export type SceneViewOverlayId = string;

export interface SceneViewHudProps {
  onOpenOverlay: (overlayId: SceneViewOverlayId) => void;
}

export interface SceneViewOverlayProps {
  overlayId: SceneViewOverlayId | null;
  onClose: () => void;
}

export interface SceneViewModule {
  HudComponent: ComponentType<SceneViewHudProps>;
  OverlayComponent: ComponentType<SceneViewOverlayProps>;
}

