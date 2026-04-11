import { MdEmojiObjects, MdOutlineLightbulb } from "react-icons/md";
import SceneOverlayShell from "../../SceneOverlayShell";
import type { LightControlDefinition } from "../controlDefinitions";
import { useLightControlModel } from "./model";

interface LightHudControlProps {
  definition: LightControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface LightOverlayControlProps {
  definition: LightControlDefinition;
  onClose: () => void;
}

export const LightHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  onOpenControl,
}: LightHudControlProps) => {
  const { isOn, sending, toggleLight } = useLightControlModel(definition);
  const isDisabled = sending || disabled;
  const hudState = isOn ? "light-on" : "light-off";

  return (
    <button
      type="button"
      data-testid={`living-control-placeholder-${definition.itemRefs.itemName}`}
      disabled={isDisabled}
      onClick={() => {
        if (!interactive) {
          return;
        }
        if (definition.interaction === "direct-toggle") {
          void toggleLight();
          return;
        }
        onOpenControl(definition.controlId);
      }}
      className="flex items-center justify-center"
      aria-label={`${definition.label} (Licht steuern)`}
    >
      <span
        className={`pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24 ${
          isOn
            ? "bg-[rgba(253,237,0,0.72)] shadow-[0_0_90px_28px_rgba(253,237,0,0.52)] hover:bg-[rgba(253,237,0,0.82)]"
            : "bg-black/30 shadow-xl hover:bg-black/45"
        }`}
      >
        {isOn ? (
          <MdEmojiObjects
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-[#FDED00] md:h-12 md:w-12"
          />
        ) : (
          <MdOutlineLightbulb
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-white md:h-12 md:w-12"
          />
        )}
      </span>
    </button>
  );
};

export const LightOverlayControl = ({
  definition,
  onClose,
}: LightOverlayControlProps) => {
  const { isOn, dimPercent, sending, toggleLight } = useLightControlModel(definition);

  return (
    <SceneOverlayShell onClose={onClose} layout="dialog">
      <div className="grid w-full grid-cols-12 gap-6 p-2 md:p-6">
        <div className="col-span-12 text-center">
          <h2 className="text-2xl font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] md:text-3xl">
            {definition.label}
          </h2>
        </div>

        <div className="col-span-12 grid place-items-center">
          <button
            type="button"
            data-testid={`light-control-${definition.controlId}`}
            onClick={() => {
              void toggleLight();
            }}
            disabled={sending}
            className="pointer-events-auto flex min-w-28 flex-col items-center rounded-2xl border border-slate-500/40 bg-white/90 px-4 py-3 text-slate-900 shadow-2xl transition hover:scale-[1.02] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            aria-label={`${definition.label} Licht ${isOn ? "ausschalten" : "einschalten"}`}
          >
            <span className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">
              {definition.label}
            </span>
            {isOn ? (
              <MdEmojiObjects
                data-testid={`light-control-${definition.controlId}-icon-on`}
                className="h-10 w-10 text-[#FDED00]"
              />
            ) : (
              <MdOutlineLightbulb
                data-testid={`light-control-${definition.controlId}-icon-off`}
                className="h-10 w-10 text-black"
              />
            )}
            {dimPercent !== null ? (
              <span
                data-testid={`light-control-${definition.controlId}-dimmer`}
                className="mt-2 text-sm font-bold text-slate-700"
              >
                {dimPercent}%
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </SceneOverlayShell>
  );
};
