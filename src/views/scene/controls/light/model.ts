import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSceneStoreCore } from "../../../../stores/sceneStoreCore";
import type { LightControlDefinition } from "../controlDefinitions";
import { sendSceneItemCommand } from "../sceneItemCommand";

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

export const useLightControlModel = (definition: LightControlDefinition) => {
  const rawState = useSceneStoreCore(
    (state) => state.itemStates[definition.itemRefs.itemName]?.rawState
  );
  const [sending, setSending] = useState(false);
  const lightState = useMemo(() => parseLightState(rawState), [rawState]);

  const toggleLight = async () => {
    if (sending) {
      return;
    }

    const command = lightState.isOn ? "OFF" : "ON";
    try {
      setSending(true);
      await sendSceneItemCommand(definition.itemRefs.itemName, command, "OnOff");
    } catch (error) {
      void error;
      toast.error(`Lichtbefehl für ${definition.label} konnte nicht gesendet werden.`);
    } finally {
      setSending(false);
    }
  };

  return {
    rawState,
    isOn: lightState.isOn,
    dimPercent: lightState.dimPercent,
    sending,
    toggleLight,
  };
};
