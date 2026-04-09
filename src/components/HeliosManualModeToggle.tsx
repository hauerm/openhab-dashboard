import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  MdAutoMode,
  MdModeFanOff,
  MdAir,
  MdSpeed,
} from "react-icons/md";
import {
  HELIOS_MANUAL_LEVEL_LABELS,
  HELIOS_MANUAL_MODE_ITEM,
} from "../types/ventilation";
import type { HeliosManualLevel } from "../types/ventilation";
import { useVentilationStore } from "../stores/ventilationStore";
import { WebSocketService } from "../services/websocket-service";
import { sendCommand } from "../services/openhab-service";
import { log } from "../services/logger";

const logger = log.createLogger("HeliosManualModeToggle");

interface HeliosManualModeToggleProps {
  showAutoButton?: boolean;
  variant?: "default" | "overlay";
}

const HeliosManualModeToggle: React.FC<HeliosManualModeToggleProps> = ({
  showAutoButton = true,
  variant = "default",
}) => {
  const { manualLevel, actualLevel } = useVentilationStore();
  const [commandLoading, setCommandLoading] = useState(false);

  // Initialize the store when component mounts
  React.useEffect(() => {
    void useVentilationStore.getState().initialize();
  }, []); // Empty dependency array - only run once on mount

  const handleModeChange = async (level: HeliosManualLevel) => {
    setCommandLoading(true);
    useVentilationStore.getState().setError(null);
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

      // Optimistic UI update; authoritative value still comes from OpenHAB updates.
      useVentilationStore.getState().updateValue(HELIOS_MANUAL_MODE_ITEM, level);
    } catch (error) {
      logger.error("Failed to send ventilation command:", error);
      useVentilationStore
        .getState()
        .setError("Failed to send ventilation command");
      toast.error("Lüftungsbefehl konnte nicht gesendet werden.");
    } finally {
      setCommandLoading(false);
    }
  };

  const getFanIcon = (level: HeliosManualLevel) => {
    const iconClassName =
      variant === "overlay" ? "h-16 w-16 md:h-24 md:w-24" : "h-11 w-11";
    const stageBadgeClassName =
      variant === "overlay"
        ? "absolute -bottom-2 -right-2 text-xl md:text-2xl font-black leading-none text-white"
        : "absolute -bottom-1 -right-1 text-xs font-extrabold leading-none text-white";

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
        return (
          <div className="relative">
            <MdAir className={iconClassName} />
            <span className={stageBadgeClassName}>
              1
            </span>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <MdAir className={iconClassName} />
            <span className={stageBadgeClassName}>
              2
            </span>
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <MdAir className={iconClassName} />
            <span className={stageBadgeClassName}>
              3
            </span>
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

  const toggleButtons: HeliosManualLevel[] = showAutoButton
    ? [-1, 0, 1, 2, 3, 4]
    : [0, 1, 2, 3, 4];

  const buttonContainerClassName =
    variant === "overlay"
      ? "grid w-full grid-cols-5 gap-2 md:gap-5"
      : "flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:gap-x-6";

  const buttonSizeClassName =
    variant === "overlay"
      ? "w-full aspect-square rounded-2xl md:rounded-3xl p-2 md:p-3"
      : "w-[74px] h-[74px] md:w-[84px] md:h-[84px] p-2 rounded-lg";

  return (
    <div className="w-full">
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
                  ? "bg-white/60 border-white/80 shadow-white/40 scale-105 shadow-2xl" // Bright white for actual operating level
                  : manualLevel === level
                  ? manualLevel === -1
                    ? "bg-green-500/30 border-green-400/50 shadow-green-400/25 scale-105 shadow-2xl" // Consistent green for automatic setpoint (matches other cards)
                    : "bg-white/40 border-white/60 shadow-white/30 scale-105 shadow-2xl" // Softer white for manual setpoint
                  : "bg-white/8 border-white/20 hover:bg-white/15 hover:scale-102 shadow-lg"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Set ventilation to ${HELIOS_MANUAL_LEVEL_LABELS[level]}`}
          >
            <div className="flex items-center justify-center">
              {commandLoading ? (
                <div
                  className={`animate-spin rounded-full border-2 border-white/60 border-t-white ${
                    variant === "overlay" ? "h-10 w-10 md:h-12 md:w-12" : "h-8 w-8"
                  }`}
                ></div>
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
            {/* Enhanced elevation for active state */}
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

export default HeliosManualModeToggle;
