export type ViewId = "house" | "eg" | "living";
export type ViewBinaryState = "on" | "off";
export type ViewRawStateKind = "on" | "off" | "undef" | "null" | "unknown";
export type LocationScope = "direct" | "descendants";

export interface ViewConfig {
  label: string;
  baseImage: string;
  location?: string;
  locationScope?: LocationScope;
}

export interface ViewTrackedItemState {
  rawState: string;
  kind: ViewRawStateKind;
  effectiveState: ViewBinaryState;
  hasLastValidState: boolean;
}

export interface ViewState {
  currentView: ViewId;
  viewLabels: Record<ViewId, string>;
  itemStates: Record<string, ViewTrackedItemState>;
  missingAssetByView: Record<ViewId, boolean>;
  loading: boolean;
  error: string | null;
}
