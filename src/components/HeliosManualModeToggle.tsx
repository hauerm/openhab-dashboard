import React, { useState, useEffect } from "react";
import { MdSettings } from "react-icons/md";
import {
  HELIOS_MANUAL_LEVEL_LABELS,
  HELIOS_MANUAL_MODE_ITEM,
} from "../types/ventilation";
import type { HeliosManualLevel } from "../types/ventilation";
import { sendCommand } from "../services/openhab-service";

const HeliosManualModeToggle: React.FC = () => {
  const [currentMode] = useState<HeliosManualLevel | null>(null);
  const [loading, setLoading] = useState(false);

  // In a real implementation, this would be updated via WebSocket
  // For now, we'll simulate or fetch initial state
  useEffect(() => {
    // TODO: Fetch initial state or rely on WebSocket
  }, []);

  const handleToggle = async () => {
    if (currentMode === null) return;
    setLoading(true);
    try {
      const modes: HeliosManualLevel[] = [-1, 0, 1, 2, 3, 4];
      const currentIndex = modes.indexOf(currentMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      const nextMode = modes[nextIndex];
      await sendCommand(HELIOS_MANUAL_MODE_ITEM, nextMode.toString());
      // WebSocket will update the state
    } catch (error) {
      console.error("Failed to send command:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayLabel =
    currentMode !== null ? HELIOS_MANUAL_LEVEL_LABELS[currentMode] : "Unknown";

  return (
    <div className="max-w-[400px] mx-auto my-8 rounded-2xl p-8 bg-surface/60 shadow-xl border border-white/20 backdrop-blur-md backdrop-saturate-150 relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <MdSettings className="w-8 h-8 text-primary-500" />
          <span className="text-primary font-bold text-2xl">
            Helios Manual Mode
          </span>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="w-full py-4 px-6 bg-primary-500 text-white rounded-lg font-bold text-xl hover:bg-primary-600 disabled:opacity-50"
          aria-label={`Toggle Helios mode, current: ${displayLabel}`}
        >
          {loading ? "Switching..." : displayLabel}
        </button>
      </div>
    </div>
  );
};

export default HeliosManualModeToggle;
