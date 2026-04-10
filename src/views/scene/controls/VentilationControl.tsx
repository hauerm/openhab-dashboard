import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaFan } from "react-icons/fa";
import { MdAutoMode, MdModeFanOff, MdAir, MdSpeed } from "react-icons/md";
import {
  HELIOS_MANUAL_LEVEL_LABELS,
  HELIOS_MANUAL_MODE_ITEM,
} from "../../../types/ventilation";
import type { HeliosManualLevel } from "../../../types/ventilation";
import { useVentilationStore } from "../../../stores/ventilationStore";
import { WebSocketService } from "../../../services/websocket-service";
import { sendCommand } from "../../../services/openhab-service";
import { log } from "../../../services/logger";

const logger = log.createLogger("VentilationControl");

type VentilationControlProps =
  | {
      variant: "hud";
      badge: string;
      onActivate: () => void;
    }
  | {
      variant: "overlay";
    };

const TEXT_SHADOW_CLASS = "[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]";

const VentilationControl = (props: VentilationControlProps) => {
  if (props.variant === "hud") {
    return (
      <button
        type="button"
        data-testid="hud-metric-ventilation"
        onClick={props.onActivate}
        className="pointer-events-auto relative rounded-full p-1 text-white/95 transition hover:text-white"
        aria-label="Lüftung öffnen"
      >
        <FaFan className="h-16 w-16 md:h-20 md:w-20" />
        <span
          className={`absolute bottom-1 right-0 rounded-full border border-white/30 bg-slate-900/80 px-1.5 py-0.5 text-xs font-bold text-white md:text-sm ${TEXT_SHADOW_CLASS}`}
        >
          {props.badge}
        </span>
      </button>
    );
  }

  const manualLevel = useVentilationStore((state) => state.manualLevel);
  const actualLevel = useVentilationStore((state) => state.actualLevel);
  const initialize = useVentilationStore((state) => state.initialize);
  const setError = useVentilationStore((state) => state.setError);
  const updateValue = useVentilationStore((state) => state.updateValue);
  const [commandLoading, setCommandLoading] = useState(false);

  React.useEffect(() => {
    void initialize();
  }, [initialize]);

  const handleModeChange = async (level: HeliosManualLevel) => {
    setCommandLoading(true);
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
      setCommandLoading(false);
    }
  };

  const getFanIcon = (level: HeliosManualLevel) => {
    const iconClassName = "h-16 w-16 md:h-24 md:w-24";
    const stageBadgeClassName =
      "absolute -bottom-2 -right-2 text-xl md:text-2xl font-black leading-none text-white";

    switch (level) {
      case -1:
        return <MdAutoMode className={iconClassName} />;
      case 0:
        return (
          <div className="relative">
            <MdModeFanOff className={iconClassName} />
            <span className={stageBadgeClassName}>0</span>
          </div>
        );
      case 1:
      case 2:
      case 3:
        return (
          <div className="relative">
            <MdAir className={iconClassName} />
            <span className={stageBadgeClassName}>{level}</span>
          </div>
        );
      case 4:
        return (
          <div className="relative">
            <MdSpeed className={iconClassName} />
            <span className={stageBadgeClassName}>4</span>
          </div>
        );
    }
  };

  const toggleButtons: HeliosManualLevel[] = [-1, 0, 1, 2, 3, 4];
  const buttonContainerClassName = "grid w-full grid-cols-6 gap-2 md:gap-5";
  const buttonSizeClassName = "w-full aspect-square rounded-2xl md:rounded-3xl p-2 md:p-3";

  return (
    <div className="w-full" data-testid="ventilation-overlay">
      <div className={buttonContainerClassName}>
        {toggleButtons.map((level) => (
          <button
            key={level}
            onClick={() => handleModeChange(level)}
            disabled={commandLoading}
            className={`
              relative ${buttonSizeClassName} font-bold text-white transition-all duration-200
              backdrop-blur-md backdrop-saturate-150 border shadow-xl
              ${
                actualLevel === level
                  ? "bg-white/60 border-white/80 shadow-white/40 scale-105 shadow-2xl"
                  : manualLevel === level
                  ? manualLevel === -1
                    ? "bg-green-500/30 border-green-400/50 shadow-green-400/25 scale-105 shadow-2xl"
                    : "bg-white/40 border-white/60 shadow-white/30 scale-105 shadow-2xl"
                  : "bg-white/8 border-white/20 hover:bg-white/15 hover:scale-102 shadow-lg"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Set ventilation to ${HELIOS_MANUAL_LEVEL_LABELS[level]}`}
          >
            <div className="flex items-center justify-center">
              {commandLoading ? (
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/60 border-t-white md:h-12 md:w-12" />
              ) : (
                <div
                  className={`${
                    actualLevel === level || manualLevel === level
                      ? "text-white"
                      : "text-white/80"
                  }`}
                >
                  {getFanIcon(level)}
                </div>
              )}
            </div>
            {(manualLevel === level || actualLevel === level) && (
              <div
                className={`absolute inset-0 rounded-lg bg-gradient-to-t ${
                  manualLevel === level && manualLevel === -1
                    ? "from-green-500/30 to-transparent"
                    : "from-white/20 to-transparent"
                } pointer-events-none shadow-inner`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VentilationControl;
