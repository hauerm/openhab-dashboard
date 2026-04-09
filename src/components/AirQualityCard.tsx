import React, { useState, useEffect } from "react";
import SemanticHistoryChartView from "./SemanticHistoryChartView";
import HeliosManualModeToggle from "./HeliosManualModeToggle";
import ErrorBoundary from "./ErrorBoundary";
import { createSemanticStore } from "../stores/semanticStore";
import { SEMANTIC_CONFIGS } from "../config/semanticTypes";
import {
  PROPERTY_TEMPERATURE,
  PROPERTY_HUMIDITY,
  PROPERTY_CO2,
  PROPERTY_AIR_QUALITY,
} from "../services/config";
import {
  MdThermostat,
  MdWaterDrop,
  MdCo2,
  MdAir,
  MdExpandLess,
  MdExpandMore,
} from "react-icons/md";
import { normalizeHealthIndex } from "../config/healthIndex";

interface AirQualityCardProps {
  location?: string;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ location }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scopeKey = location?.trim() || "__all__";
  const cardTitle = location ? `Luftqualität ${location}` : "Luftqualität";

  const tempStore = React.useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_TEMPERATURE], scopeKey),
    [scopeKey]
  );
  const humidityStore = React.useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_HUMIDITY], scopeKey),
    [scopeKey]
  );
  const co2Store = React.useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_CO2], scopeKey),
    [scopeKey]
  );
  const aqiStore = React.useMemo(
    () => createSemanticStore(SEMANTIC_CONFIGS[PROPERTY_AIR_QUALITY], scopeKey),
    [scopeKey]
  );

  const initializeTemperature = tempStore((state) => state.initialize);
  const initializeHumidity = humidityStore((state) => state.initialize);
  const initializeCo2 = co2Store((state) => state.initialize);
  const initializeAqi = aqiStore((state) => state.initialize);

  useEffect(() => {
    void Promise.all([
      initializeTemperature(location),
      initializeHumidity(location),
      initializeCo2(location),
      initializeAqi(location),
    ]);
  }, [
    location,
    initializeTemperature,
    initializeHumidity,
    initializeCo2,
    initializeAqi,
  ]);

  const tempValue = tempStore((state) => state.currentValue);
  const humidityValue = humidityStore((state) => state.currentValue);
  const co2Value = co2Store((state) => state.currentValue);
  const aqiValue = aqiStore((state) => state.currentValue);

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
    const level = normalizeHealthIndex(value);
    if (level === null) return "text-white/60";
    if (level <= 1) return "text-green-400";
    if (level === 2) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="w-full max-w-6xl rounded-2xl p-4 bg-slate-900/40 shadow-xl border border-white/15 backdrop-blur-md backdrop-saturate-150 relative overflow-hidden">
      <div className="relative z-10">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between mb-4 -mt-8 pt-8 -mx-8 px-8 pb-4 rounded-t-2xl bg-slate-800/45 backdrop-blur-sm">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white mr-2">
              {cardTitle}
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
            {isCollapsed ? (
              <MdExpandMore className="w-6 h-6 text-white" />
            ) : (
              <MdExpandLess className="w-6 h-6 text-white" />
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4">
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <SemanticHistoryChartView
                  semanticProperty={PROPERTY_TEMPERATURE}
                  location={location}
                  title="Temperatur"
                  className="h-[320px]"
                  comfortBand={{ min: 20, max: 24, label: "Komfortzone" }}
                />
              </ErrorBoundary>
            </div>
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <SemanticHistoryChartView
                  semanticProperty={PROPERTY_HUMIDITY}
                  location={location}
                  title="Luftfeuchtigkeit"
                  className="h-[320px]"
                />
              </ErrorBoundary>
            </div>
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <SemanticHistoryChartView
                  semanticProperty={PROPERTY_CO2}
                  location={location}
                  title="CO₂"
                  className="h-[320px]"
                />
              </ErrorBoundary>
            </div>
            <div className="min-w-[250px]">
              <ErrorBoundary>
                <SemanticHistoryChartView
                  semanticProperty={PROPERTY_AIR_QUALITY}
                  location={location}
                  title="Luftqualität"
                  className="h-[320px]"
                />
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
