import React, { useState } from "react";
import Icon from "@mdi/react";
import {
  mdiFanOff,
  mdiFanSpeed1,
  mdiFanSpeed2,
  mdiFanSpeed3,
  mdiFan,
  mdiFanAuto,
} from "@mdi/js";
import {
  HELIOS_MANUAL_LEVEL_LABELS,
  HELIOS_MANUAL_MODE_ITEM,
} from "../types/ventilation";
import type { HeliosManualLevel } from "../types/ventilation";
import { sendCommand } from "../services/openhab-service";
import { useVentilationStore } from "../stores/ventilationStore";
import { registerWebSocketListener } from "../services/websocket-service";

const HeliosManualModeToggle: React.FC = () => {
  const { currentLevel, initialize } = useVentilationStore();
  const [commandLoading, setCommandLoading] = useState(false);

  // Initialize the store when component mounts
  React.useEffect(() => {
    const initStore = async () => {
      await initialize();
      registerWebSocketListener((itemName, value) =>
        useVentilationStore.getState().handleWebSocketMessage(itemName, value)
      );
    };
    initStore();
  }, [initialize]);

  const handleModeChange = async (level: HeliosManualLevel) => {
    setCommandLoading(true);
    try {
      await sendCommand(HELIOS_MANUAL_MODE_ITEM, level.toString());
    } catch (error) {
      console.error("Failed to send ventilation command:", error);
    } finally {
      setCommandLoading(false);
    }
  };

  const getFanIcon = (level: HeliosManualLevel) => {
    const iconSize = 1.5; // rem units for MDI icons
    switch (level) {
      case -1:
        return <Icon path={mdiFanAuto} size={iconSize} />;
      case 0:
        return <Icon path={mdiFanOff} size={iconSize} />;
      case 1:
        return <Icon path={mdiFanSpeed1} size={iconSize} />;
      case 2:
        return <Icon path={mdiFanSpeed2} size={iconSize} />;
      case 3:
        return <Icon path={mdiFanSpeed3} size={iconSize} />;
      case 4:
        return <Icon path={mdiFan} size={iconSize} />;
    }
  };

  const toggleButtons: { level: HeliosManualLevel; label: string }[] = [
    { level: -1, label: "Auto" },
    { level: 0, label: "Aus" },
    { level: 1, label: "1" },
    { level: 2, label: "2" },
    { level: 3, label: "3" },
    { level: 4, label: "Max" },
  ];

  return (
    <div className="w-full">
      {/* Fancy toggle buttons */}
      <div className="grid grid-cols-6 gap-2">
        {toggleButtons.map(({ level }) => (
          <button
            key={level}
            onClick={() => handleModeChange(level)}
            disabled={commandLoading}
            className={`
              relative p-3 rounded-lg font-bold text-white transition-all duration-200
              backdrop-blur-md backdrop-saturate-150 border shadow-xl aspect-square
              ${
                currentLevel === level
                  ? "bg-white/40 border-white/60 shadow-white/30 scale-105 shadow-2xl"
                  : "bg-white/8 border-white/20 hover:bg-white/15 hover:scale-102 shadow-lg"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Set ventilation to ${HELIOS_MANUAL_LEVEL_LABELS[level]}`}
          >
            <div className="flex items-center justify-center">
              <div
                className={`${
                  currentLevel === level ? "text-white" : "text-white/80"
                }`}
              >
                {getFanIcon(level)}
              </div>
            </div>
            {/* Enhanced elevation for active state */}
            {currentLevel === level && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-white/20 to-transparent pointer-events-none shadow-inner" />
            )}
          </button>
        ))}
      </div>

      {commandLoading && (
        <p className="text-center text-white/60 text-sm mt-4">
          Switching ventilation mode...
        </p>
      )}
    </div>
  );
};

export default HeliosManualModeToggle;
