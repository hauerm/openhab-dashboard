import { describe, expect, it } from "vitest";
import {
  applySceneItemStateUpdate,
  resolveSceneImagePath,
  SCENE_MISSING_FALLBACK_IMAGE,
} from "./sceneStore.utils";

describe("sceneStore utils", () => {
  it("keeps last valid scene state for UNDEF/NULL", () => {
    const onState = applySceneItemStateUpdate(undefined, "ON");
    const undefState = applySceneItemStateUpdate(onState, "UNDEF");
    const nullState = applySceneItemStateUpdate(undefState, "NULL");

    expect(undefState.effectiveState).toBe("on");
    expect(nullState.effectiveState).toBe("on");
    expect(nullState.hasLastValidState).toBe(true);
  });

  it("falls back to light:off when no prior valid state exists", () => {
    const unknown = applySceneItemStateUpdate(undefined, "UNDEF");
    expect(unknown.effectiveState).toBe("off");
    expect(unknown.hasLastValidState).toBe(false);
  });

  it("returns base image and fallback flag when scene asset is missing", () => {
    const resolved = resolveSceneImagePath(
      {
        label: "Haus",
        baseImage: "/scenes/house/base.webp",
      },
      true
    );

    expect(resolved.resolvedImage).toBe(SCENE_MISSING_FALLBACK_IMAGE);
    expect(resolved.requestedSceneImage).toBe("/scenes/house/base.webp");
    expect(resolved.usedFallback).toBe(true);
  });
});
