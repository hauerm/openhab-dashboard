import SemanticCard from "../../../components/SemanticCard";
import HeliosManualModeToggle from "../../../components/HeliosManualModeToggle";
import {
  PROPERTY_AIR_QUALITY,
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "../../../services/config";
import type { SceneViewOverlayProps } from "../types";
import SceneOverlayShell from "../SceneOverlayShell";

export type EgOverlayId =
  | "semantic:temp"
  | "semantic:humidity"
  | "semantic:co2"
  | "semantic:health"
  | "ventilation";

const SEMANTIC_OVERLAY_CONFIG: Record<
  Exclude<EgOverlayId, "ventilation">,
  { semanticProperty: string; title: string }
> = {
  "semantic:temp": {
    semanticProperty: PROPERTY_TEMPERATURE,
    title: "Temperatur EG",
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
      <SceneOverlayShell onClose={onClose}>
        <h2 className="mb-3 text-lg font-semibold text-white">Lüftungssteuerung</h2>
        <HeliosManualModeToggle />
      </SceneOverlayShell>
    );
  }

  const config = SEMANTIC_OVERLAY_CONFIG[overlayId];
  return (
    <SceneOverlayShell onClose={onClose}>
      <h2 className="mb-3 text-lg font-semibold text-white">{config.title}</h2>
      <SemanticCard semanticProperty={config.semanticProperty} location="EG" />
    </SceneOverlayShell>
  );
};

export default EgOverlay;

