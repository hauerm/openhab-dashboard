import React, { useState, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiChevronUp, mdiChevronDown } from "@mdi/js";
import TemperatureCard from "./TemperatureCard";
import HumidityCard from "./HumidityCard";
import CO2Card from "./CO2Card";
import AQICard from "./AQICard";
import HeliosManualModeToggle from "./HeliosManualModeToggle";
import ErrorBoundary from "./ErrorBoundary";
import { initializeWebSocket } from "../services/websocket-service";
import { useTemperatureStore } from "../stores/temperatureStore";
import { useHumidityStore } from "../stores/humidityStore";
import { useCO2Store } from "../stores/co2Store";
import { useAQIStore } from "../stores/aqiStore";
import { MdThermostat, MdWaterDrop, MdCo2, MdAir } from "react-icons/md";

interface AirQualityCardProps {
  location?: string;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ location }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get current values from stores for collapsed view
  const tempValue = useTemperatureStore((state) => state.currentValue);
  const humidityValue = useHumidityStore((state) => state.currentValue);
  const co2Value = useCO2Store((state) => state.currentValue);
  const aqiValue = useAQIStore((state) => state.currentValue);

  useEffect(() => {
    initializeWebSocket();
  }, []);

  // Color functions for each metric (extracted from individual cards)
  const getTemperatureColor = (value: number | null) => {
    if (value === null) return "text-white/60";
    if (value < 18) return "text-blue-400";
    if (value <= 25) return "text-green-400";
    return "text-red-400";
  };

  const getHumidityColor = (value: number | null) => {
    if (value === null) return "text-white/60";
    if (value < 30) return "text-blue-400";
    if (value <= 60) return "text-green-400";
    return "text-amber-400";
  };

  const getCO2Color = (value: number | null) => {
    if (value === null) return "text-white/60";
    if (value < 800) return "text-green-400";
    if (value <= 1200) return "text-amber-400";
    return "text-red-400";
  };

  const getAQIColor = (value: number | null) => {
    if (value === null) return "text-white/60";
    if (value < 50) return "text-green-400";
    if (value <= 100) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="w-full max-w-6xl rounded-2xl p-8 bg-surface/60 shadow-xl border border-white/20 backdrop-blur-md backdrop-saturate-150 relative overflow-hidden">
      <div className="relative z-10">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between mb-8 -mt-8 pt-4 -mx-8 px-4 pb-4 rounded-t-2xl bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white mr-2">
              Luftqualität EG
            </h1>
            {isCollapsed && (
              <div className="flex items-center space-x-3">
                <MdThermostat
                  className={`w-6 h-6 ${getTemperatureColor(tempValue)}`}
                />
                <MdWaterDrop
                  className={`w-6 h-6 ${getHumidityColor(humidityValue)}`}
                />
                <MdCo2 className={`w-6 h-6 ${getCO2Color(co2Value)}`} />
                <MdAir className={`w-6 h-6 ${getAQIColor(aqiValue)}`} />
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
            aria-label={
              isCollapsed
                ? "Expand air quality details"
                : "Collapse air quality details"
            }
          >
            <Icon
              path={isCollapsed ? mdiChevronDown : mdiChevronUp}
              size={1.2}
              className="text-white"
            />
          </button>
        </div>

        {/* Collapsed view: manual mode toggle only */}
        {isCollapsed && (
          <div className="">
            <HeliosManualModeToggle />
          </div>
        )}

        {/* Expanded view: full cards */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <TemperatureCard location={location} />
              </ErrorBoundary>
            </div>
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <HumidityCard location={location} />
              </ErrorBoundary>
            </div>
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <CO2Card location={location} />
              </ErrorBoundary>
            </div>
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <AQICard location={location} />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* Manual mode toggle - always visible when expanded */}
        {!isCollapsed && (
          <div className="col-span-1 md:col-span-2 min-w-[250px]">
            <ErrorBoundary>
              <HeliosManualModeToggle />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityCard;
