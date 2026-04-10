export type ViewId = "house" | "eg" | "living";
export type SceneBinaryState = "on" | "off";
export type SceneRawStateKind = "on" | "off" | "undef" | "null" | "unknown";

export interface SceneViewConfig {
  label: string;
  baseImage: string;
}

export interface SceneTrackedItemState {
  rawState: string;
  kind: SceneRawStateKind;
  effectiveState: SceneBinaryState;
  hasLastValidState: boolean;
}

export interface SceneState {
  currentView: ViewId;
  itemStates: Record<string, SceneTrackedItemState>;
  missingAssetByView: Record<ViewId, boolean>;
  loading: boolean;
  error: string | null;
}
