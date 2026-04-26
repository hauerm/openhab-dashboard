import type {
  ViewBinaryState,
  ViewConfig,
  ViewRawStateKind,
  ViewTrackedItemState,
} from "../types/view";

export const VIEW_MISSING_FALLBACK_IMAGE = "/views/missing.jpg";

export interface NormalizedViewRawState {
  kind: ViewRawStateKind;
  value: ViewBinaryState | null;
}

export const normalizeViewRawState = (
  rawState: string
): NormalizedViewRawState => {
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

export const applyViewItemStateUpdate = (
  previous: ViewTrackedItemState | undefined,
  rawState: string,
  options: { optimisticUpdateId?: number } = {}
): ViewTrackedItemState => {
  const normalized = normalizeViewRawState(rawState);
  if (normalized.value !== null) {
    return {
      rawState,
      kind: normalized.kind,
      effectiveState: normalized.value,
      hasLastValidState: true,
      ...(options.optimisticUpdateId !== undefined
        ? { optimisticUpdateId: options.optimisticUpdateId }
        : {}),
    };
  }

  if (previous?.hasLastValidState) {
    return {
      rawState,
      kind: normalized.kind,
      effectiveState: previous.effectiveState,
      hasLastValidState: true,
      ...(options.optimisticUpdateId !== undefined
        ? { optimisticUpdateId: options.optimisticUpdateId }
        : {}),
    };
  }

  return {
    rawState,
    kind: normalized.kind,
    effectiveState: "off",
    hasLastValidState: false,
    ...(options.optimisticUpdateId !== undefined
      ? { optimisticUpdateId: options.optimisticUpdateId }
      : {}),
  };
};

export interface ResolvedViewImage {
  requestedViewImage: string;
  resolvedImage: string;
  usedFallback: boolean;
}

export const resolveViewImagePath = (
  viewConfig: ViewConfig,
  missingViewAsset: boolean
): ResolvedViewImage => {
  const requestedViewImage = viewConfig.baseImage;

  if (missingViewAsset) {
    return {
      requestedViewImage,
      resolvedImage: VIEW_MISSING_FALLBACK_IMAGE,
      usedFallback: true,
    };
  }

  return {
    requestedViewImage,
    resolvedImage: requestedViewImage,
    usedFallback: false,
  };
};
