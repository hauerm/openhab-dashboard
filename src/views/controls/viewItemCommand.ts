import { sendCommand } from "../../services/openhab-service";
import { WebSocketService } from "../../services/websocket-service";
import { log } from "../../services/logger";
import type { OpenHABCommandType } from "../../types/openhab-types";
import { useViewStore } from "../../stores/viewStore";

const logger = log.createLogger("ViewItemCommand");

interface SendViewItemCommandOptions {
  optimisticRawState?: string;
}

export const sendViewItemCommand = async (
  itemName: string,
  command: string,
  commandType: OpenHABCommandType,
  options: SendViewItemCommandOptions = {}
): Promise<void> => {
  let sentViaWebSocket = false;
  const optimisticSnapshot = options.optimisticRawState
    ? useViewStore
        .getState()
        .setOptimisticItemState(itemName, options.optimisticRawState)
    : null;

  try {
    if (WebSocketService.isConnected()) {
      try {
        await WebSocketService.sendCommand(itemName, command, commandType);
        sentViaWebSocket = true;
        logger.debug(`Command sent via WebSocket: ${itemName}=${command}`);
      } catch (error) {
        logger.warn(
          `WebSocket command failed for ${itemName}, falling back to REST:`,
          error
        );
      }
    }

    if (!sentViaWebSocket) {
      await sendCommand(itemName, command);
      logger.debug(`Command sent via REST: ${itemName}=${command}`);
    }
  } catch (error) {
    if (optimisticSnapshot) {
      useViewStore.getState().rollbackOptimisticItemState(optimisticSnapshot);
    }
    throw error;
  }
};
