import type { OpenHABSemanticModel } from "../domain/openhab-model";

export type ViewId = string;
export type ViewBinaryState = "on" | "off";
export type ViewRawStateKind = "on" | "off" | "undef" | "null" | "unknown";
export type LocationScope = "direct" | "descendants";
export type LocationPropertyMeasurementRole = "ambient";

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
  viewIds: ViewId[];
  viewConfigs: Record<ViewId, ViewConfig>;
  viewLabels: Record<ViewId, string>;
  itemStates: Record<string, ViewTrackedItemState>;
  missingAssetByView: Record<ViewId, boolean>;
  model: OpenHABSemanticModel | null;
  loading: boolean;
  error: string | null;
}
