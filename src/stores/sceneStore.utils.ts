import type {
  SceneBinaryState,
  SceneKey,
  SceneRawStateKind,
  SceneTrackedItemState,
  SceneViewConfig,
} from "../types/scene";

export const SCENE_MISSING_FALLBACK_IMAGE = "/scenes/missing.jpg";

export interface NormalizedSceneRawState {
  kind: SceneRawStateKind;
  value: SceneBinaryState | null;
}

export const normalizeSceneRawState = (
  rawState: string
): NormalizedSceneRawState => {
  const normalized = rawState.trim().toUpperCase();

  if (normalized === "ON") {
    return { kind: "on", value: "on" };
  }
  if (normalized === "OFF") {
    return { kind: "off", value: "off" };
  }
  if (normalized === "UNDEF") {
    return { kind: "undef", value: null };
  }
  if (normalized === "NULL" || normalized === "-") {
    return { kind: "null", value: null };
  }

  const numericValue = Number.parseFloat(normalized.replace(",", "."));
  if (!Number.isNaN(numericValue)) {
    return {
      kind: numericValue > 0 ? "on" : "off",
      value: numericValue > 0 ? "on" : "off",
    };
  }

  return { kind: "unknown", value: null };
};

export const applySceneItemStateUpdate = (
  previous: SceneTrackedItemState | undefined,
  rawState: string
): SceneTrackedItemState => {
  const normalized = normalizeSceneRawState(rawState);
  if (normalized.value !== null) {
    return {
      rawState,
      kind: normalized.kind,
      effectiveState: normalized.value,
      hasLastValidState: true,
    };
  }

  if (previous?.hasLastValidState) {
    return {
      rawState,
      kind: normalized.kind,
      effectiveState: previous.effectiveState,
      hasLastValidState: true,
    };
  }

  return {
    rawState,
    kind: normalized.kind,
    effectiveState: "off",
    hasLastValidState: false,
  };
};

export const computeSceneKey = (
  sceneItems: string[],
  itemStates: Record<string, SceneTrackedItemState>
): SceneKey =>
  sceneItems.some((itemName) => itemStates[itemName]?.effectiveState === "on")
    ? "light:on"
    : "light:off";

export const computeSceneKeysByView = (
  views: Record<string, SceneViewConfig>,
  itemStates: Record<string, SceneTrackedItemState>
): Record<string, SceneKey> => {
  const sceneKeyByView: Record<string, SceneKey> = {};
  for (const [viewId, viewConfig] of Object.entries(views)) {
    sceneKeyByView[viewId] = computeSceneKey(viewConfig.sceneItems, itemStates);
  }
  return sceneKeyByView;
};

export interface ResolvedSceneImage {
  requestedSceneImage: string;
  resolvedImage: string;
  usedFallback: boolean;
}

export const resolveSceneImagePath = (
  viewConfig: SceneViewConfig,
  sceneKey: SceneKey,
  missingSceneAsset: boolean
): ResolvedSceneImage => {
  const requestedSceneImage =
    viewConfig.sceneImages[sceneKey] ?? viewConfig.baseImage;

  if (missingSceneAsset) {
    return {
      requestedSceneImage,
      resolvedImage: SCENE_MISSING_FALLBACK_IMAGE,
      usedFallback: true,
    };
  }

  return {
    requestedSceneImage,
    resolvedImage: requestedSceneImage,
    usedFallback: false,
  };
};
