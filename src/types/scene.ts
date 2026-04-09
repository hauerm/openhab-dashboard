import type { NamedItemName } from "../domain/hauer-items";

export type ViewId = "house" | "eg";
export type SceneKey = "light:on" | "light:off";
export type SceneBinaryState = "on" | "off";
export type SceneRawStateKind = "on" | "off" | "undef" | "null" | "unknown";

export interface SceneViewConfig {
  label: string;
  baseImage: string;
  sceneImages: Record<SceneKey, string>;
  sceneItems: NamedItemName[];
}

export interface SceneTrackedItemState {
  rawState: string;
  kind: SceneRawStateKind;
  effectiveState: SceneBinaryState;
  hasLastValidState: boolean;
}

export interface SceneState {
  currentView: ViewId;
  sceneKeyByView: Record<ViewId, SceneKey>;
  itemStates: Record<string, SceneTrackedItemState>;
  missingAssetByView: Record<ViewId, boolean>;
  loading: boolean;
  error: string | null;
}
