import { useMemo } from "react";
import { useViewStore } from "../../../stores/viewStore";
import type { RaffstoreControlDefinition } from "../controlDefinitions";

type RaffstoreHudState = "raffstore-open" | "raffstore-half" | "raffstore-closed";

export const parseOpeningPercent = (rawState: string | undefined): number | null => {
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

const resolveRaffstoreHudState = (
  openingPercent: number | null
): RaffstoreHudState => {
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

const resolveOpeningDisplayValue = (
  subtype: RaffstoreControlDefinition["subtype"],
  openingPercent: number | null
): string => {
  if (openingPercent === null) {
    return "--";
  }

  if (subtype === "garagedoor") {
    if (openingPercent === 0) {
      return "Geschlossen";
    }
    if (openingPercent === 100) {
      return "Offen";
    }
    return `${openingPercent}%`;
  }

  if (openingPercent === 0) {
    return "Oben";
  }
  if (openingPercent === 100) {
    return "Unten";
  }
  return `${openingPercent}%`;
};

const resolveOpeningHudState = (
  subtype: RaffstoreControlDefinition["subtype"],
  openingPercent: number | null
): RaffstoreHudState => {
  if (subtype === "garagedoor" && openingPercent !== null) {
    return resolveRaffstoreHudState(100 - openingPercent);
  }
  return resolveRaffstoreHudState(openingPercent);
};

export const useRaffstoreControlModel = (definition: RaffstoreControlDefinition) => {
  const itemNames = useMemo(
    () =>
      definition.itemRefs.itemNames.length > 0
        ? definition.itemRefs.itemNames
        : [definition.itemRefs.itemName],
    [definition.itemRefs.itemName, definition.itemRefs.itemNames]
  );
  const itemStates = useViewStore((state) => state.itemStates);
  const rawStates = useMemo(
    () => itemNames.map((itemName) => itemStates[itemName]?.rawState),
    [itemNames, itemStates]
  );

  return useMemo(() => {
    const parsedValues = rawStates
      .map(parseOpeningPercent)
      .filter((value): value is number => value !== null);
    const openingPercent =
      parsedValues.length === 0
        ? null
        : Math.round(
            parsedValues.reduce((sum, value) => sum + value, 0) / parsedValues.length
          );
    const openingDisplayValue = resolveOpeningDisplayValue(
      definition.subtype,
      openingPercent
    );

    return {
      rawState: rawStates[0],
      openingPercent,
      openingDisplayValue,
      hudState: resolveOpeningHudState(definition.subtype, openingPercent),
    };
  }, [definition.subtype, rawStates]);
};
