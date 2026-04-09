import { describe, expect, it } from "vitest";
import type { SceneTrackedItemState } from "../types/scene";
import {
  applySceneItemStateUpdate,
  computeSceneKey,
  resolveSceneImagePath,
  SCENE_MISSING_FALLBACK_IMAGE,
} from "./sceneStore.utils";

describe("sceneStore utils", () => {
  it("computes light:on if at least one mapped item is ON", () => {
    const itemStates: Record<string, SceneTrackedItemState> = {
      lightA: applySceneItemStateUpdate(undefined, "OFF"),
      lightB: applySceneItemStateUpdate(undefined, "ON"),
    };

    expect(computeSceneKey(["lightA", "lightB"], itemStates)).toBe("light:on");
  });

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
        baseImage: "/scenes/house/base.jpg",
        sceneImages: {
          "light:on": "/scenes/house/light-on.jpg",
          "light:off": "/scenes/house/light-off.jpg",
        },
        sceneItems: [],
      },
      "light:on",
      true
    );

    expect(resolved.resolvedImage).toBe(SCENE_MISSING_FALLBACK_IMAGE);
    expect(resolved.requestedSceneImage).toBe("/scenes/house/light-on.jpg");
    expect(resolved.usedFallback).toBe(true);
  });
});
