import { useViewStore } from "../../stores/viewStore";
import type {
  DimmerControlDefinition,
  LightControlDefinition,
  OpeningControlDefinition,
  PowerControlDefinition,
  RgbwLightControlDefinition,
  ViewControlDefinition,
} from "../controls/controlDefinitions";
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

type ShadingAggregateDefinition = OpeningControlDefinition & {
  subtype: "raffstore" | "rollershutter";
};

type PowerAggregateDefinition = PowerControlDefinition;

const isLightAggregateDefinition = (
  definition: ViewControlDefinition
): definition is LightAggregateDefinition =>
  definition.controlType === "light" ||
  definition.controlType === "dimmer" ||
  definition.controlType === "rgbw-light";

const isShadingAggregateDefinition = (
  definition: ViewControlDefinition
): definition is ShadingAggregateDefinition =>
  definition.controlType === "opening" &&
  (definition.subtype === "raffstore" || definition.subtype === "rollershutter");

const isPowerAggregateDefinition = (
  definition: ViewControlDefinition
): definition is PowerAggregateDefinition => definition.controlType === "power";

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

export const sendShadingAggregateCommand = async (
  definitions: readonly ViewControlDefinition[],
  command: "UP" | "STOP" | "DOWN"
): Promise<AggregateCommandResult> => {
  const itemNames = Array.from(
    new Set(
      definitions
        .filter(isShadingAggregateDefinition)
        .flatMap((definition) =>
          definition.itemRefs.itemNames.length > 0
            ? definition.itemRefs.itemNames
            : [definition.itemRefs.itemName]
        )
        .map((itemName) => itemName.trim())
        .filter((itemName) => itemName.length > 0)
    )
  );

  return settle(
    itemNames.map((itemName) => async () => {
      await sendViewItemCommand(
        itemName,
        command,
        command === "STOP" ? "StopMove" : "UpDown"
      );
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
