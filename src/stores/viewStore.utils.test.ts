import { describe, expect, it } from "vitest";
import {
  applyViewItemStateUpdate,
  resolveViewImagePath,
  VIEW_MISSING_FALLBACK_IMAGE,
} from "./viewStore.utils";

describe("viewStore utils", () => {
  it("keeps last valid view state for UNDEF/NULL", () => {
    const onState = applyViewItemStateUpdate(undefined, "ON");
    const undefState = applyViewItemStateUpdate(onState, "UNDEF");
    const nullState = applyViewItemStateUpdate(undefState, "NULL");

    expect(undefState.effectiveState).toBe("on");
    expect(nullState.effectiveState).toBe("on");
    expect(nullState.hasLastValidState).toBe(true);
  });

  it("falls back to light:off when no prior valid state exists", () => {
    const unknown = applyViewItemStateUpdate(undefined, "UNDEF");
    expect(unknown.effectiveState).toBe("off");
    expect(unknown.hasLastValidState).toBe(false);
  });

  it("returns base image and fallback flag when view asset is missing", () => {
    const resolved = resolveViewImagePath(
      {
        label: "Haus",
        baseImage: "/views/house/base.webp",
      },
      true
    );

    expect(resolved.resolvedImage).toBe(VIEW_MISSING_FALLBACK_IMAGE);
    expect(resolved.requestedViewImage).toBe("/views/house/base.webp");
    expect(resolved.usedFallback).toBe(true);
  });
});
