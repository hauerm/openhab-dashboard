import React, { useEffect } from "react";
import TemperatureCard from "./TemperatureCard";
import HumidityCard from "./HumidityCard";
import CO2Card from "./CO2Card";
import AQICard from "./AQICard";
import HeliosManualModeToggle from "./HeliosManualModeToggle";
import ErrorBoundary from "./ErrorBoundary";
import { initializeWebSocket } from "../services/websocket-service";

interface AirQualityCardProps {
  location?: string;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ location }) => {
  useEffect(() => {
    initializeWebSocket();
  }, []);

  return (
    <div className="max-w-6xl mx-auto my-8 rounded-2xl p-8 bg-surface/60 shadow-xl border border-white/20 backdrop-blur-md backdrop-saturate-150 relative overflow-hidden min-w-[314px] md:min-w-[596px]">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-left mb-8 text-gray-900">
          Luftqualität EG
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
          <div className="col-span-1 md:col-span-2 min-w-[250px]">
            <ErrorBoundary>
              <HeliosManualModeToggle />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityCard;
