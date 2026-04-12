export type ViewId = "house" | "eg" | "living";
export type ViewBinaryState = "on" | "off";
export type ViewRawStateKind = "on" | "off" | "undef" | "null" | "unknown";

export interface ViewConfig {
  label: string;
  baseImage: string;
  location?: string;
}

export interface ViewTrackedItemState {
  rawState: string;
  kind: ViewRawStateKind;
  effectiveState: ViewBinaryState;
  hasLastValidState: boolean;
}

export interface ViewState {
  currentView: ViewId;
  itemStates: Record<string, ViewTrackedItemState>;
  missingAssetByView: Record<ViewId, boolean>;
  loading: boolean;
  error: string | null;
}
