import LocationPropertyHistoryControl from "../../controls/LocationPropertyHistoryControl";
import VentilationControl from "../../controls/VentilationControl";
import { MdClose } from "react-icons/md";
import type { SceneViewOverlayProps } from "../../types";
import SceneOverlayShell from "../../SceneOverlayShell";
import { useEgViewStore } from "./useEgViewStore";

const EgOverlay = ({ overlayId, onClose }: SceneViewOverlayProps) => {
  const { controls } = useEgViewStore();
  const control = controls.find((entry) => entry.overlayId === overlayId);

  if (!overlayId || !control) {
    return null;
  }

  if (control.kind === "ventilation") {
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
            <VentilationControl variant="overlay" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <SceneOverlayShell onClose={onClose} layout="fullscreen">
      <LocationPropertyHistoryControl
        property={control.property}
        location="EG"
        title={control.title}
        comfortBand={control.comfortBand}
        className="h-full"
      />
    </SceneOverlayShell>
  );
};

export default EgOverlay;
