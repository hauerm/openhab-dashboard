import { MdEmojiObjects, MdOutlineLightbulb } from "react-icons/md";
import ViewOverlayShell from "../../ViewOverlayShell";
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
            ? "bg-semantic-light-solid shadow-[0_0_90px_28px_var(--color-semantic-light-glow)] hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
      >
        {isOn ? (
          <MdEmojiObjects
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-ui-surface-shell md:h-12 md:w-12"
          />
        ) : (
          <MdOutlineLightbulb
            data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
            className="h-10 w-10 text-ui-foreground md:h-12 md:w-12"
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
    <ViewOverlayShell onClose={onClose} layout="dialog">
      <div className="grid w-full grid-cols-12 gap-6 p-2 md:p-6">
        <div className="col-span-12 text-center">
          <h2 className="text-2xl font-bold text-ui-foreground [text-shadow:0_2px_8px_var(--color-ui-shadow-text)] md:text-3xl">
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
            className="pointer-events-auto flex min-w-28 flex-col items-center rounded-2xl border border-ui-border-subtle bg-ui-foreground px-4 py-3 text-ui-surface-shell shadow-2xl transition hover:scale-[1.02] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label={`${definition.label} Licht ${isOn ? "ausschalten" : "einschalten"}`}
          >
            <span className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ui-surface-shell">
              {definition.label}
            </span>
            {isOn ? (
              <MdEmojiObjects
                data-testid={`light-control-${definition.controlId}-icon-on`}
                className="h-10 w-10 text-semantic-light-solid"
              />
            ) : (
              <MdOutlineLightbulb
                data-testid={`light-control-${definition.controlId}-icon-off`}
                className="h-10 w-10 text-ui-surface-shell"
              />
            )}
            {dimPercent !== null ? (
              <span
                data-testid={`light-control-${definition.controlId}-dimmer`}
                className="mt-2 text-sm font-bold text-ui-surface-shell"
              >
                {dimPercent}%
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </ViewOverlayShell>
  );
};
