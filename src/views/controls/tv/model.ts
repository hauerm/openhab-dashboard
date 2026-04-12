import { useMemo } from "react";
import { useViewStore } from "../../../stores/viewStore";
import type { TvControlDefinition } from "../controlDefinitions";

export type TvAppLogoKey = "netflix" | "prime-video";

export type TvDisplayMode =
  | "off"
  | "program"
  | "app-logo"
  | "app-text"
  | "fallback";

export interface TvDisplayState {
  isOn: boolean;
  sourceApp: string | null;
  channelName: string | null;
  channelNumber: string | null;
  title: string | null;
  displayMode: TvDisplayMode;
  smallLine: string | null;
  largeLine: string | null;
  appLogoKey: TvAppLogoKey | null;
}

const normalizeDisplayValue = (value: string | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const normalized = trimmed.toUpperCase();
  if (normalized === "UNDEF" || normalized === "NULL" || normalized === "-") {
    return null;
  }

  return trimmed;
};

export const resolveTvAppLogoKey = (
  sourceApp: string | null
): TvAppLogoKey | null => {
  if (!sourceApp) {
    return null;
  }

  const normalized = sourceApp.trim().toLowerCase();
  if (normalized === "netflix") {
    return "netflix";
  }
  if (
    normalized === "prime" ||
    normalized === "prime video" ||
    normalized === "amazon prime" ||
    normalized === "amazon prime video"
  ) {
    return "prime-video";
  }

  return null;
};

export const resolveTvDisplayState = (
  powerRawState: string | undefined,
  sourceAppRawState: string | undefined,
  channelNameRawState: string | undefined,
  channelNumberRawState: string | undefined,
  titleRawState: string | undefined
): TvDisplayState => {
  const isOn = normalizeDisplayValue(powerRawState)?.toUpperCase() === "ON";
  const sourceApp = normalizeDisplayValue(sourceAppRawState);
  const channelName = normalizeDisplayValue(channelNameRawState);
  const channelNumber = normalizeDisplayValue(channelNumberRawState);
  const title = normalizeDisplayValue(titleRawState);

  if (!isOn) {
    return {
      isOn: false,
      sourceApp,
      channelName,
      channelNumber,
      title,
      displayMode: "off",
      smallLine: null,
      largeLine: null,
      appLogoKey: null,
    };
  }

  if (sourceApp) {
    const appLogoKey = resolveTvAppLogoKey(sourceApp);
    return {
      isOn: true,
      sourceApp,
      channelName,
      channelNumber,
      title,
      displayMode: appLogoKey ? "app-logo" : "app-text",
      smallLine: null,
      largeLine: appLogoKey ? null : sourceApp,
      appLogoKey,
    };
  }

  const channelLine =
    channelNumber && channelName
      ? `${channelNumber} ${channelName}`
      : channelName ?? channelNumber;

  if (channelLine && title) {
    return {
      isOn: true,
      sourceApp,
      channelName,
      channelNumber,
      title,
      displayMode: "program",
      smallLine: channelLine,
      largeLine: title,
      appLogoKey: null,
    };
  }

  if (title) {
    return {
      isOn: true,
      sourceApp,
      channelName,
      channelNumber,
      title,
      displayMode: "fallback",
      smallLine: null,
      largeLine: title,
      appLogoKey: null,
    };
  }

  if (channelLine) {
    return {
      isOn: true,
      sourceApp,
      channelName,
      channelNumber,
      title,
      displayMode: "fallback",
      smallLine: null,
      largeLine: channelLine,
      appLogoKey: null,
    };
  }

  return {
    isOn: true,
    sourceApp,
    channelName,
    channelNumber,
    title,
    displayMode: "fallback",
    smallLine: null,
    largeLine: "Läuft",
    appLogoKey: null,
  };
};

export const useTvControlModel = (
  definition: TvControlDefinition
) => {
  const itemStates = useViewStore((state) => state.itemStates);

  return useMemo(() => {
    const powerRawState = itemStates[definition.itemRefs.powerItemName]?.rawState;
    const displayState = resolveTvDisplayState(
      powerRawState,
      itemStates[definition.itemRefs.applicationItemName]?.rawState,
      itemStates[definition.itemRefs.channelNameItemName]?.rawState,
      itemStates[definition.itemRefs.channelNumberItemName]?.rawState,
      itemStates[definition.itemRefs.titleItemName]?.rawState
    );

    return {
      powerRawState,
      ...displayState,
    };
  }, [definition, itemStates]);
};
