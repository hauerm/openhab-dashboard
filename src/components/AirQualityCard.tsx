import React, { useEffect } from "react";
import TemperatureCard from "./TemperatureCard";
import HumidityCard from "./HumidityCard";
import CO2Card from "./CO2Card";
import AQICard from "./AQICard";
import HeliosManualModeToggle from "./HeliosManualModeToggle";
import ErrorBoundary from "./ErrorBoundary";
import { initializeWebSocket } from "../services/webSocketService";

const AirQualityCard: React.FC = () => {
  useEffect(() => {
    initializeWebSocket();
  }, []);

  return (
    <div className="max-w-6xl mx-auto my-8 rounded-2xl p-8 bg-surface/60 shadow-xl border border-white/20 backdrop-blur-md backdrop-saturate-150 relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-left mb-8 text-gray-900">
          Luftqualität EG
        </h1>
        <div className="grid grid-cols-2 gap-8 items-start">
          <ErrorBoundary>
            <TemperatureCard />
          </ErrorBoundary>
          <ErrorBoundary>
            <HumidityCard />
          </ErrorBoundary>
          <ErrorBoundary>
            <CO2Card />
          </ErrorBoundary>
          <ErrorBoundary>
            <AQICard />
          </ErrorBoundary>
          <div className="col-span-2">
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
