import type { ComponentType } from "react";

export interface SceneViewProps {
  activeControlId: string | null;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
}

export interface SceneViewModule {
  Component: ComponentType<SceneViewProps>;
}
