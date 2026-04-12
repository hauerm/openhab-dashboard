import type { ComponentType } from "react";

export interface ViewProps {
  activeControlId: string | null;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
  blockedLeftPx?: number;
}

export interface ViewModule {
  Component: ComponentType<ViewProps>;
}
