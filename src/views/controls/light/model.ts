import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useViewStore } from "../../../stores/viewStore";
import type {
  DimmerControlDefinition,
  LightControlDefinition,
} from "../controlDefinitions";
import { sendViewItemCommand } from "../viewItemCommand";

interface ParsedLightState {
  isOn: boolean;
  dimPercent: number | null;
}

interface ParsedDimmerState {
  isOn: boolean;
  brightness: number;
}

const SLIDER_COMMAND_THROTTLE_MS = 120;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

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

export const parseDimmerState = (rawState: string | undefined): ParsedDimmerState => {
  if (!rawState) {
    return { isOn: false, brightness: 0 };
  }

  const normalized = rawState.trim().toUpperCase();
  if (normalized === "ON") {
    return { isOn: true, brightness: 100 };
  }
  if (
    normalized === "OFF" ||
    normalized === "UNDEF" ||
    normalized === "NULL" ||
    normalized === "-"
  ) {
    return { isOn: false, brightness: 0 };
  }

  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return { isOn: false, brightness: 0 };
  }

  const parsed = Number.parseFloat(match[0].replace(",", "."));
  if (!Number.isFinite(parsed)) {
    return { isOn: false, brightness: 0 };
  }

  const brightness = Math.round(clamp(parsed, 0, 100));
  return {
    isOn: brightness > 0,
    brightness,
  };
};

export const useLightControlModel = (definition: LightControlDefinition) => {
  const rawState = useViewStore(
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
      await sendViewItemCommand(definition.itemRefs.itemName, command, "OnOff", {
        optimisticRawState: command,
      });
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

export const useDimmerControlModel = (definition: DimmerControlDefinition) => {
  const rawState = useViewStore(
    (state) => state.itemStates[definition.itemRefs.itemName]?.rawState
  );
  const [sending, setSending] = useState(false);
  const [optimisticBrightness, setOptimisticBrightness] = useState<number | null>(
    null
  );
  const pendingBrightnessRef = useRef<number | null>(null);
  const throttleTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const lastIssuedAtRef = useRef(0);
  const activeCommandRef = useRef<string | null>(null);
  const lastSentCommandRef = useRef<string | null>(null);
  const flushPendingBrightnessRef = useRef<() => void>(() => undefined);
  const parsedState = useMemo(() => parseDimmerState(rawState), [rawState]);
  const brightness = optimisticBrightness ?? parsedState.brightness;
  const isOn = brightness > 0;

  useEffect(() => {
    setOptimisticBrightness(null);
  }, [rawState]);

  useEffect(
    () => () => {
      if (throttleTimerRef.current !== null) {
        window.clearTimeout(throttleTimerRef.current);
      }
    },
    []
  );

  const scheduleFlush = useCallback((delayMs: number) => {
    if (throttleTimerRef.current !== null) {
      return;
    }

    throttleTimerRef.current = window.setTimeout(() => {
      throttleTimerRef.current = null;
      flushPendingBrightnessRef.current();
    }, delayMs);
  }, []);

  const sendBrightnessNow = useCallback(
    async (nextBrightness: number) => {
      const nextCommand = String(Math.round(clamp(nextBrightness, 0, 100)));
      if (
        nextCommand === activeCommandRef.current ||
        nextCommand === lastSentCommandRef.current
      ) {
        return;
      }

      inFlightRef.current = true;
      activeCommandRef.current = nextCommand;
      setSending(true);
      try {
        await sendViewItemCommand(
          definition.itemRefs.itemName,
          nextCommand,
          "Percent"
        );
        lastSentCommandRef.current = nextCommand;
        lastIssuedAtRef.current = Date.now();
      } catch (error) {
        void error;
        setOptimisticBrightness(null);
        toast.error(`Dimmerbefehl für ${definition.label} konnte nicht gesendet werden.`);
      } finally {
        activeCommandRef.current = null;
        inFlightRef.current = false;
        setSending(false);

        if (pendingBrightnessRef.current !== null) {
          scheduleFlush(SLIDER_COMMAND_THROTTLE_MS);
        }
      }
    },
    [definition.itemRefs.itemName, definition.label, scheduleFlush]
  );

  useEffect(() => {
    flushPendingBrightnessRef.current = () => {
      if (inFlightRef.current) {
        return;
      }

      const nextBrightness = pendingBrightnessRef.current;
      if (nextBrightness === null) {
        return;
      }

      pendingBrightnessRef.current = null;
      void sendBrightnessNow(nextBrightness);
    };
  }, [sendBrightnessNow]);

  const setBrightness = useCallback(
    (nextBrightness: number, force = false) => {
      const clampedBrightness = Math.round(clamp(nextBrightness, 0, 100));
      setOptimisticBrightness(clampedBrightness);
      pendingBrightnessRef.current = clampedBrightness;

      if (force && throttleTimerRef.current !== null) {
        window.clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }

      if (force) {
        flushPendingBrightnessRef.current();
        return;
      }

      if (throttleTimerRef.current !== null || inFlightRef.current) {
        return;
      }

      const elapsedMs = Date.now() - lastIssuedAtRef.current;
      scheduleFlush(Math.max(SLIDER_COMMAND_THROTTLE_MS - elapsedMs, 0));
    },
    [scheduleFlush]
  );

  const toggleDimmer = async () => {
    if (sending) {
      return;
    }

    const command = isOn ? "OFF" : "ON";
    const optimisticRawState = isOn ? "OFF" : "ON";
    try {
      setSending(true);
      setOptimisticBrightness(isOn ? 0 : 100);
      await sendViewItemCommand(definition.itemRefs.itemName, command, "OnOff", {
        optimisticRawState,
      });
    } catch (error) {
      void error;
      setOptimisticBrightness(null);
      toast.error(`Dimmerbefehl für ${definition.label} konnte nicht gesendet werden.`);
    } finally {
      setSending(false);
    }
  };

  return {
    rawState,
    isOn,
    brightness,
    sending,
    toggleDimmer,
    setBrightness,
  };
};
