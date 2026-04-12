import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useVentilationStore } from "../../../stores/ventilationStore";
import { WebSocketService } from "../../../services/websocket-service";
import { sendCommand } from "../../../services/openhab-service";
import { log } from "../../../services/logger";
import {
  HELIOS_MANUAL_MODE_ITEM,
  type HeliosManualLevel,
} from "../../../types/ventilation";
import { formatVentilationBadge } from "./presentation";

const logger = log.createLogger("VentilationControl");

const toSortedArray = (itemNames: Set<string>): string[] =>
  Array.from(itemNames).sort((left, right) => left.localeCompare(right));

export const useVentilationLayoutMetadataItemNames = (): readonly string[] => {
  const itemNames = useVentilationStore((state) => state.itemNames);

  return useMemo(() => toSortedArray(itemNames), [itemNames]);
};

export const useVentilationControlModel = () => {
  const initialize = useVentilationStore((state) => state.initialize);
  const manualLevel = useVentilationStore((state) => state.manualLevel);
  const actualLevel = useVentilationStore((state) => state.actualLevel);
  const setError = useVentilationStore((state) => state.setError);
  const updateValue = useVentilationStore((state) => state.updateValue);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const setManualLevel = async (level: HeliosManualLevel) => {
    setSending(true);
    setError(null);

    try {
      const command = level.toString();
      let sent = false;

      if (WebSocketService.isConnected()) {
        try {
          await WebSocketService.sendCommand(
            HELIOS_MANUAL_MODE_ITEM,
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
        await sendCommand(HELIOS_MANUAL_MODE_ITEM, command);
        logger.debug(`Command sent via REST: ${command}`);
      }

      updateValue(HELIOS_MANUAL_MODE_ITEM, level);
    } catch (error) {
      logger.error("Failed to send ventilation command:", error);
      setError("Failed to send ventilation command");
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
