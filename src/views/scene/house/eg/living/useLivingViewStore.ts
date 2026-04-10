import { useMemo } from "react";
import { useSceneStoreCore } from "../../../../../stores/sceneStoreCore";
import {
  KNX_JA1_Raffstore_Wohnzimmer,
  KNX_JA1_Raffstore_Wohnzimmer_Strasse,
  SAH3_Licht_Couch,
  SAH3_Licht_TV,
} from "openhab-hauer-items/items";

type LivingControlKind = "raffstore" | "light";
type LivingControlInteraction = "overlay" | "direct-toggle";
type LivingLightVariant = "onoff" | "dimmer";
type LivingHudState =
  | "raffstore-open"
  | "raffstore-half"
  | "raffstore-closed"
  | "light-on"
  | "light-off";

export interface LivingSceneControl {
  itemName: string;
  viewId: "living";
  kind: LivingControlKind;
  interaction: LivingControlInteraction;
  label: string;
  overlayId: string;
  defaultPosition: { x: number; y: number };
  rawState: string | undefined;
  hudState: LivingHudState;
}

interface LivingSceneControlConfig {
  itemName: string;
  viewId: "living";
  kind: LivingControlKind;
  lightVariant?: LivingLightVariant;
  label: string;
  defaultPosition: { x: number; y: number };
}

export const buildLivingControlOverlayId = (itemName: string): string =>
  `control:${itemName}`;

export const parseLivingControlOverlayItemName = (
  overlayId: string | null
): string | null => {
  if (!overlayId || !overlayId.startsWith("control:")) {
    return null;
  }
  const itemName = overlayId.slice("control:".length);
  return itemName.length > 0 ? itemName : null;
};

const parseRaffstoreOpeningPercent = (rawState: string | undefined): number | null => {
  if (!rawState) {
    return null;
  }

  const normalized = rawState.trim().toUpperCase();
  if (normalized === "UNDEF" || normalized === "NULL" || normalized === "-") {
    return null;
  }

  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[0].replace(",", "."));
  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(parsed)));
};

const resolveRaffstoreHudState = (rawState: string | undefined): LivingHudState => {
  const openingPercent = parseRaffstoreOpeningPercent(rawState);

  // UNDEF/NULL should be treated like "closed".
  if (openingPercent === null) {
    return "raffstore-closed";
  }
  if (openingPercent <= 24) {
    return "raffstore-open";
  }
  if (openingPercent <= 75) {
    return "raffstore-half";
  }
  return "raffstore-closed";
};

const resolveLightHudState = (rawState: string | undefined): LivingHudState => {
  if (!rawState) {
    return "light-off";
  }

  const normalized = rawState.trim().toUpperCase();
  if (normalized === "ON") {
    return "light-on";
  }
  if (normalized === "OFF" || normalized === "UNDEF" || normalized === "NULL") {
    return "light-off";
  }

  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return "light-off";
  }
  const parsed = Number.parseFloat(match[0].replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? "light-on" : "light-off";
};

const LIVING_CONTROL_CONFIGS: LivingSceneControlConfig[] = [
  {
    itemName: KNX_JA1_Raffstore_Wohnzimmer,
    viewId: "living",
    kind: "raffstore",
    label: "Raffstore Innen",
    defaultPosition: { x: 22, y: 22 },
  },
  {
    itemName: KNX_JA1_Raffstore_Wohnzimmer_Strasse,
    viewId: "living",
    kind: "raffstore",
    label: "Raffstore Straße",
    defaultPosition: { x: 40, y: 22 },
  },
  {
    itemName: SAH3_Licht_Couch,
    viewId: "living",
    kind: "light",
    lightVariant: "onoff",
    label: "Licht Couch",
    defaultPosition: { x: 75, y: 74 },
  },
  {
    itemName: SAH3_Licht_TV,
    viewId: "living",
    kind: "light",
    lightVariant: "onoff",
    label: "Licht TV",
    defaultPosition: { x: 90, y: 74 },
  },
];

interface LivingViewState {
  controls: LivingSceneControl[];
}

export const useLivingViewStore = (): LivingViewState => {
  const itemStates = useSceneStoreCore((state) => state.itemStates);

  return useMemo(
    () => ({
      controls: LIVING_CONTROL_CONFIGS.map((config) => {
        const rawState = itemStates[config.itemName]?.rawState;
        const hudState =
          config.kind === "raffstore"
            ? resolveRaffstoreHudState(rawState)
            : resolveLightHudState(rawState);
        const interaction: LivingControlInteraction =
          config.kind === "light" && config.lightVariant === "onoff"
            ? "direct-toggle"
            : "overlay";

        return {
          ...config,
          rawState,
          hudState,
          interaction,
          overlayId: buildLivingControlOverlayId(config.itemName),
        };
      }),
    }),
    [itemStates]
  );
};
