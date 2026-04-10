import SemanticHistoryChartView from "../../../../components/SemanticHistoryChartView";
import HeliosManualModeToggle from "../../../../components/HeliosManualModeToggle";
import { MdClose } from "react-icons/md";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "../../../../services/config";
import type { SceneViewOverlayProps } from "../../types";
import SceneOverlayShell from "../../SceneOverlayShell";

export type EgOverlayId =
  | "semantic:temp"
  | "semantic:humidity"
  | "semantic:co2"
  | "semantic:health"
  | "ventilation";

const SEMANTIC_OVERLAY_CONFIG: Record<
  Exclude<EgOverlayId, "ventilation">,
  {
    semanticProperty: string;
    title: string;
    comfortBand?: { min: number; max: number; label?: string };
  }
> = {
  "semantic:temp": {
    semanticProperty: PROPERTY_TEMPERATURE,
    title: "Temperatur EG",
    comfortBand: { min: 20, max: 24, label: "Komfortzone" },
  },
  "semantic:humidity": {
    semanticProperty: PROPERTY_HUMIDITY,
    title: "Luftfeuchte EG",
  },
  "semantic:co2": {
    semanticProperty: PROPERTY_CO2,
    title: "CO₂ EG",
  },
  "semantic:health": {
    semanticProperty: PROPERTY_AIR_QUALITY,
    title: "Air Quality EG",
  },
};

const isEgOverlayId = (overlayId: string): overlayId is EgOverlayId =>
  overlayId === "semantic:temp" ||
  overlayId === "semantic:humidity" ||
  overlayId === "semantic:co2" ||
  overlayId === "semantic:health" ||
  overlayId === "ventilation";

const EgOverlay = ({ overlayId, onClose }: SceneViewOverlayProps) => {
  if (!overlayId || !isEgOverlayId(overlayId)) {
    return null;
  }

  if (overlayId === "ventilation") {
    return (
      <div
        data-testid="overlay-backdrop"
        className="fixed inset-0 z-50 bg-black/32 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="relative flex h-full w-full items-center justify-center px-4 md:px-8"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 rounded-full border border-white/25 bg-slate-900/60 p-1.5 text-white/90 transition hover:bg-slate-800/80 hover:text-white"
            aria-label="Overlay schließen"
          >
            <MdClose className="h-5 w-5" />
          </button>
          <div className="w-full max-w-7xl">
            <HeliosManualModeToggle showAutoButton={false} variant="overlay" />
          </div>
        </div>
      </div>
    );
  }

  const config = SEMANTIC_OVERLAY_CONFIG[overlayId];
  return (
    <SceneOverlayShell onClose={onClose} layout="fullscreen">
      <SemanticHistoryChartView
        semanticProperty={config.semanticProperty}
        location="EG"
        title={config.title}
        comfortBand={config.comfortBand}
        className="h-full"
      />
    </SceneOverlayShell>
  );
};

export default EgOverlay;
