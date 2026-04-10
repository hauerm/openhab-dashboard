import { useEffect } from "react";
import LightControl from "../../../controls/LightControl";
import RaffstoreControl from "../../../controls/RaffstoreControl";
import type { SceneViewOverlayProps } from "../../../types";
import {
  parseLivingControlOverlayItemName,
  useLivingViewStore,
} from "./useLivingViewStore";

const LivingOverlay = ({ overlayId, onClose }: SceneViewOverlayProps) => {
  const { controls } = useLivingViewStore();
  const controlItemName = parseLivingControlOverlayItemName(overlayId);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!controlItemName) {
    return null;
  }

  const control = controls.find((candidate) => candidate.itemName === controlItemName);
  if (!control) {
    return null;
  }

  return (
    <div
      data-testid="overlay-backdrop"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${control.label} Steuerung`}
    >
      {control.kind === "raffstore" ? (
        <RaffstoreControl
          controlId={control.itemName}
          label={control.label}
          itemName={control.itemName}
          openingRawState={control.rawState}
          variant="overlay-fullscreen"
        />
      ) : (
        <div className="grid h-full w-full grid-cols-12 gap-4 p-4 md:p-8">
          <div className="col-span-12 grid place-items-center">
            <div
              className="pointer-events-auto grid w-full max-w-6xl grid-cols-12 gap-6 rounded-3xl border border-white/20 bg-slate-950/65 p-6 shadow-2xl md:p-10"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="col-span-12 text-center">
                <h2 className="text-2xl font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] md:text-3xl">
                  {control.label}
                </h2>
              </div>

              <div className="col-span-12 grid place-items-center">
                <LightControl
                  controlId={control.itemName}
                  label={control.label}
                  itemName={control.itemName}
                  rawState={control.rawState}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivingOverlay;
