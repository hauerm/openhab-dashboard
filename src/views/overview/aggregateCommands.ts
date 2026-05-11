import { useViewStore } from "../../stores/viewStore";
import type {
  DimmerControlDefinition,
  LightControlDefinition,
  OpeningControlDefinition,
  PowerControlDefinition,
  RgbwLightControlDefinition,
  ViewControlDefinition,
} from "../controls/controlDefinitions";
import { sendRaffstoreCommand } from "../controls/raffstore/commands";
import { parseOpeningPercent } from "../controls/raffstore/model";
import {
  runArbeitsstellung as runRaffstoreArbeitsstellung,
  runSchliessen as runRaffstoreSchliessen,
  runTiltPreset as runRaffstoreTiltPreset,
  type RaffstoreTiltPreset,
} from "../controls/raffstore/sequences";
import { parseHsbState, hsbToCommand } from "../controls/rgbw-light/model";
import { sendViewItemCommand } from "../controls/viewItemCommand";

export interface AggregateCommandResult {
  attempted: number;
  failed: number;
}

type LightAggregateDefinition =
  | LightControlDefinition
  | DimmerControlDefinition
  | RgbwLightControlDefinition;

type RaffstoreAggregateDefinition = OpeningControlDefinition & {
  subtype: "raffstore";
};

type RollershutterAggregateDefinition = OpeningControlDefinition & {
  subtype: "rollershutter";
};

type PowerAggregateDefinition = PowerControlDefinition;
export type RaffstoreAggregatePreset =
  | "arbeitsstellung"
  | "schliessen"
  | RaffstoreTiltPreset;

const isLightAggregateDefinition = (
  definition: ViewControlDefinition
): definition is LightAggregateDefinition =>
  definition.controlType === "light" ||
  definition.controlType === "dimmer" ||
  definition.controlType === "rgbw-light";

const isRaffstoreAggregateDefinition = (
  definition: ViewControlDefinition
): definition is RaffstoreAggregateDefinition =>
  definition.controlType === "opening" && definition.subtype === "raffstore";

const isRollershutterAggregateDefinition = (
  definition: ViewControlDefinition
): definition is RollershutterAggregateDefinition =>
  definition.controlType === "opening" && definition.subtype === "rollershutter";

const isPowerAggregateDefinition = (
  definition: ViewControlDefinition
): definition is PowerAggregateDefinition => definition.controlType === "power";

const getOpeningItemNames = (definition: OpeningControlDefinition): string[] =>
  Array.from(
    new Set(
      (definition.itemRefs.itemNames.length > 0
        ? definition.itemRefs.itemNames
        : [definition.itemRefs.itemName]
      )
        .map((itemName) => itemName.trim())
        .filter((itemName) => itemName.length > 0)
    )
  );

const resolveOpeningPercent = (
  definition: OpeningControlDefinition,
  itemStates: ReturnType<typeof useViewStore.getState>["itemStates"]
): number | null => {
  const parsedValues = getOpeningItemNames(definition)
    .map((itemName) => parseOpeningPercent(itemStates[itemName]?.rawState))
    .filter((value): value is number => value !== null);

  if (parsedValues.length === 0) {
    return null;
  }

  return Math.round(
    parsedValues.reduce((sum, value) => sum + value, 0) / parsedValues.length
  );
};

const settle = async (
  tasks: readonly (() => Promise<void>)[]
): Promise<AggregateCommandResult> => {
  const results = await Promise.allSettled(tasks.map((task) => task()));
  return {
    attempted: results.length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
};

export const sendLightsAggregateCommand = async (
  definitions: readonly ViewControlDefinition[],
  command: "ON" | "OFF"
): Promise<AggregateCommandResult> => {
  const itemStates = useViewStore.getState().itemStates;
  const lightDefinitions = definitions.filter(isLightAggregateDefinition);

  return settle(
    lightDefinitions.map((definition) => async () => {
      if (
        definition.controlType === "light" ||
        definition.controlType === "dimmer"
      ) {
        await sendViewItemCommand(definition.itemRefs.itemName, command, "OnOff", {
          optimisticRawState: command,
        });
        return;
      }

      const itemName = definition.itemRefs.colorItemName;
      const currentColor = parseHsbState(itemStates[itemName]?.rawState);
      const nextColor = {
        ...currentColor,
        brightness: command === "ON" ? 100 : 0,
      };
      const nextCommand = hsbToCommand(nextColor);
      await sendViewItemCommand(itemName, nextCommand, "HSB", {
        optimisticRawState: nextCommand,
      });
    })
  );
};

export const sendRaffstoreAggregatePresetCommand = async (
  definitions: readonly ViewControlDefinition[],
  preset: RaffstoreAggregatePreset
): Promise<AggregateCommandResult> => {
  const itemStates = useViewStore.getState().itemStates;
  const raffstoreDefinitions = definitions.filter(isRaffstoreAggregateDefinition);

  return settle(
    raffstoreDefinitions.flatMap((definition) => {
      const itemNames = getOpeningItemNames(definition);
      if (itemNames.length === 0) {
        return [];
      }

      return [
        async () => {
          const sequenceContext = {
            sendCommand: (command: "UP" | "DOWN" | "STOP") =>
              sendRaffstoreCommand(itemNames, command),
            getOpeningPercent: () => resolveOpeningPercent(definition, itemStates),
          };
          const signal = new AbortController().signal;

          if (preset === "arbeitsstellung") {
            await runRaffstoreArbeitsstellung(sequenceContext, signal);
            return;
          }
          if (preset === "schliessen") {
            await runRaffstoreSchliessen(sequenceContext, signal);
            return;
          }
          await runRaffstoreTiltPreset(sequenceContext, preset, signal);
        },
      ];
    })
  );
};

export const sendRollershutterAggregateCommand = async (
  definitions: readonly ViewControlDefinition[],
  command: "UP" | "DOWN"
): Promise<AggregateCommandResult> => {
  const itemNames = Array.from(
    new Set(
      definitions
        .filter(isRollershutterAggregateDefinition)
        .flatMap(getOpeningItemNames)
    )
  );

  return settle(
    itemNames.map((itemName) => async () => {
      await sendViewItemCommand(itemName, command, "UpDown");
    })
  );
};

export const sendPowerAggregateCommand = async (
  definitions: readonly ViewControlDefinition[],
  command: "ON" | "OFF"
): Promise<AggregateCommandResult> => {
  const itemNames = Array.from(
    new Set(
      definitions
        .filter(isPowerAggregateDefinition)
        .map((definition) => definition.itemRefs.powerItemName.trim())
        .filter((itemName) => itemName.length > 0)
    )
  );

  return settle(
    itemNames.map((itemName) => async () => {
      await sendViewItemCommand(itemName, command, "OnOff", {
        optimisticRawState: command,
      });
    })
  );
};
