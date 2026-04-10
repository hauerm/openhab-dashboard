import { sendCommand } from "../../../services/openhab-service";
import { WebSocketService } from "../../../services/websocket-service";
import { log } from "../../../services/logger";
import type { OpenHABCommandType } from "../../../types/openhab-types";

const logger = log.createLogger("SceneItemCommand");

export const sendSceneItemCommand = async (
  itemName: string,
  command: string,
  commandType: OpenHABCommandType
): Promise<void> => {
  let sentViaWebSocket = false;

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
};
