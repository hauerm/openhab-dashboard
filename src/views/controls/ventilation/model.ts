import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useViewStore } from "../../../stores/viewStore";
import { WebSocketService } from "../../../services/websocket-service";
import { sendCommand } from "../../../services/openhab-service";
import { log } from "../../../services/logger";
import { type HeliosManualLevel } from "../../../types/ventilation";
import { parseOpenHABState } from "../../../services/state-parser";
import type { VentilationControlDefinition } from "../controlDefinitions";
import { formatVentilationBadge } from "./presentation";

const logger = log.createLogger("VentilationControl");

const parseHeliosLevel = (rawState: string | undefined): HeliosManualLevel | null => {
  if (!rawState) {
    return null;
  }
  const parsed = parseOpenHABState(rawState).numericValue;
  if (parsed === null) {
    return null;
  }
  return parsed as HeliosManualLevel;
};

export const useVentilationLayoutMetadataItemNames = (): readonly string[] => [];

export const useVentilationControlModel = (
  definition: VentilationControlDefinition
) => {
  const manualRawState = useViewStore(
    (state) => state.itemStates[definition.itemRefs.manualModeItemName]?.rawState
  );
  const actualRawState = useViewStore(
    (state) => state.itemStates[definition.itemRefs.actualLevelItemName]?.rawState
  );
  const manualLevel = useMemo(
    () => parseHeliosLevel(manualRawState),
    [manualRawState]
  );
  const actualLevel = useMemo(() => parseHeliosLevel(actualRawState), [actualRawState]);
  const [sending, setSending] = useState(false);

  const setManualLevel = async (level: HeliosManualLevel) => {
    setSending(true);

    try {
      const command = level.toString();
      let sent = false;

      if (WebSocketService.isConnected()) {
        try {
          await WebSocketService.sendCommand(
            definition.itemRefs.manualModeItemName,
            command,
            "Decimal"
          );
          sent = true;
          logger.debug(`Command sent via WebSocket: ${command}`);
        } catch (error) {
          logger.warn("WebSocket command failed, falling back to REST:", error);
        }
      }

      if (!sent) {
        await sendCommand(definition.itemRefs.manualModeItemName, command);
        logger.debug(`Command sent via REST: ${command}`);
      }
    } catch (error) {
      logger.error("Failed to send ventilation command:", error);
      toast.error("Lüftungsbefehl konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  };

  return {
    manualLevel,
    actualLevel,
    badge: formatVentilationBadge(manualLevel, actualLevel),
    sending,
    setManualLevel,
  };
};
