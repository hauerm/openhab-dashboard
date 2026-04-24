import { useMemo } from "react";
import { useViewStore } from "../../../stores/viewStore";
import type { RaffstoreControlDefinition } from "../controlDefinitions";

const parseOpeningPercent = (rawState: string | undefined): number | null => {
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
): "raffstore-open" | "raffstore-half" | "raffstore-closed" => {
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
    const openingDisplayValue =
      openingPercent === null
        ? "--"
        : openingPercent === 0
        ? "Oben"
        : openingPercent === 100
        ? "Unten"
        : `${openingPercent}%`;

    return {
      rawState: rawStates[0],
      openingPercent,
      openingDisplayValue,
      hudState: resolveRaffstoreHudState(openingPercent),
    };
  }, [rawStates]);
};
