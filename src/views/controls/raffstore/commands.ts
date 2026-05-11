import { sendViewItemCommand } from "../viewItemCommand";
import type { RaffstoreMotionCommand } from "./sequences";

export const sendRaffstoreCommand = async (
  itemNames: readonly string[],
  command: RaffstoreMotionCommand
): Promise<void> => {
  if (command === "STOP") {
    await Promise.all(
      itemNames.map((itemName) => sendViewItemCommand(itemName, command, "StopMove"))
    );
    return;
  }
  await Promise.all(
    itemNames.map((itemName) => sendViewItemCommand(itemName, command, "UpDown"))
  );
};
