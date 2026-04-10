import { useMemo, useState } from "react";
import { MdEmojiObjects, MdOutlineLightbulb } from "react-icons/md";
import { toast } from "react-toastify";
import { sendSceneItemCommand } from "./sceneItemCommand";

interface LightControlProps {
  controlId: string;
  label: string;
  itemName: string;
  rawState?: string;
  disabled?: boolean;
}

interface ParsedLightState {
  isOn: boolean;
  dimPercent: number | null;
}

const parseLightState = (rawState: string | undefined): ParsedLightState => {
  if (!rawState) {
    return { isOn: false, dimPercent: null };
  }

  const normalized = rawState.trim().toUpperCase();
  if (normalized === "ON") {
    return { isOn: true, dimPercent: null };
  }
  if (normalized === "OFF") {
    return { isOn: false, dimPercent: null };
  }
  if (normalized === "UNDEF" || normalized === "NULL" || normalized === "-") {
    return { isOn: false, dimPercent: null };
  }

  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return { isOn: false, dimPercent: null };
  }

  const parsed = Number.parseFloat(match[0].replace(",", "."));
  if (Number.isNaN(parsed)) {
    return { isOn: false, dimPercent: null };
  }

  const dimPercent = Math.max(0, Math.min(100, Math.round(parsed)));
  return {
    isOn: dimPercent > 0,
    dimPercent,
  };
};

const LightControl = ({
  controlId,
  label,
  itemName,
  rawState,
  disabled = false,
}: LightControlProps) => {
  const [sending, setSending] = useState(false);
  const lightState = useMemo(() => parseLightState(rawState), [rawState]);
  const isDisabled = sending || disabled;

  const toggleLight = async () => {
    if (isDisabled) {
      return;
    }

    const command = lightState.isOn ? "OFF" : "ON";
    try {
      setSending(true);
      await sendSceneItemCommand(itemName, command, "OnOff");
    } catch (error) {
      void error;
      toast.error(`Lichtbefehl für ${label} konnte nicht gesendet werden.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      type="button"
      data-testid={`light-control-${controlId}`}
      onClick={() => {
        void toggleLight();
      }}
      disabled={isDisabled}
      className="pointer-events-auto flex min-w-28 flex-col items-center rounded-2xl border border-slate-500/40 bg-white/90 px-4 py-3 text-slate-900 shadow-2xl transition hover:scale-[1.02] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
      aria-label={`${label} Licht ${lightState.isOn ? "ausschalten" : "einschalten"}`}
    >
      <span className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">
        {label}
      </span>
      {lightState.isOn ? (
        <MdEmojiObjects
          data-testid={`light-control-${controlId}-icon-on`}
          className="h-10 w-10 text-amber-400"
        />
      ) : (
        <MdOutlineLightbulb
          data-testid={`light-control-${controlId}-icon-off`}
          className="h-10 w-10 text-black"
        />
      )}
      {lightState.dimPercent !== null && (
        <span
          data-testid={`light-control-${controlId}-dimmer`}
          className="mt-2 text-sm font-bold text-slate-700"
        >
          {lightState.dimPercent}%
        </span>
      )}
    </button>
  );
};

export default LightControl;
