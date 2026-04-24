import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useViewStore } from "../../../stores/viewStore";
import type { RgbwLightControlDefinition } from "../controlDefinitions";
import { sendViewItemCommand } from "../viewItemCommand";

export interface HsbColor {
  hue: number;
  saturation: number;
  brightness: number;
}

const FALLBACK_HSB: HsbColor = {
  hue: 45,
  saturation: 80,
  brightness: 100,
};
const SLIDER_COMMAND_THROTTLE_MS = 120;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const parseNumberPart = (value: string | undefined): number | null => {
  if (value === undefined) {
    return null;
  }
  const parsed = Number.parseFloat(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseHsbState = (rawState: string | undefined): HsbColor => {
  if (!rawState) {
    return { ...FALLBACK_HSB, brightness: 0 };
  }

  const normalized = rawState.trim().toUpperCase();
  if (normalized === "UNDEF" || normalized === "NULL" || normalized === "-") {
    return { ...FALLBACK_HSB, brightness: 0 };
  }
  if (normalized === "OFF") {
    return { ...FALLBACK_HSB, brightness: 0 };
  }
  if (normalized === "ON") {
    return FALLBACK_HSB;
  }

  const [rawHue, rawSaturation, rawBrightness] = normalized.split(",");
  const hue = parseNumberPart(rawHue);
  const saturation = parseNumberPart(rawSaturation);
  const brightness = parseNumberPart(rawBrightness);

  if (hue === null || saturation === null || brightness === null) {
    return { ...FALLBACK_HSB, brightness: 0 };
  }

  return {
    hue: Math.round(clamp(hue, 0, 360)),
    saturation: Math.round(clamp(saturation, 0, 100)),
    brightness: Math.round(clamp(brightness, 0, 100)),
  };
};

export const hsbToCommand = (color: HsbColor): string =>
  `${Math.round(clamp(color.hue, 0, 360))},${Math.round(
    clamp(color.saturation, 0, 100)
  )},${Math.round(clamp(color.brightness, 0, 100))}`;

export const hsbToCssColor = (color: HsbColor): string =>
  `hsl(${Math.round(clamp(color.hue, 0, 360))} ${Math.round(
    clamp(color.saturation, 0, 100)
  )}% ${Math.round(30 + clamp(color.brightness, 0, 100) * 0.38)}%)`;

export const createToggleColor = (color: HsbColor): HsbColor => ({
  ...color,
  brightness: color.brightness > 0 ? 0 : 100,
});

export const useRgbwLightControlModel = (
  definition: RgbwLightControlDefinition
) => {
  const rawState = useViewStore(
    (state) => state.itemStates[definition.itemRefs.colorItemName]?.rawState
  );
  const [sending, setSending] = useState(false);
  const [optimisticColor, setOptimisticColor] = useState<HsbColor | null>(null);
  const pendingColorRef = useRef<HsbColor | null>(null);
  const throttleTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const lastIssuedAtRef = useRef(0);
  const activeCommandRef = useRef<string | null>(null);
  const lastSentCommandRef = useRef<string | null>(null);
  const flushPendingColorRef = useRef<() => void>(() => undefined);
  const parsedColor = useMemo(() => parseHsbState(rawState), [rawState]);
  const color = optimisticColor ?? parsedColor;
  const isOn = color.brightness > 0;
  const cssColor = useMemo(() => hsbToCssColor(color), [color]);

  useEffect(() => {
    setOptimisticColor(null);
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
      flushPendingColorRef.current();
    }, delayMs);
  }, []);

  const sendColorNow = useCallback(
    async (nextColor: HsbColor) => {
      const nextCommand = hsbToCommand(nextColor);
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
          definition.itemRefs.colorItemName,
          nextCommand,
          "HSB"
        );
        lastSentCommandRef.current = nextCommand;
        lastIssuedAtRef.current = Date.now();
      } catch (error) {
        void error;
        toast.error(`RGBW-Befehl für ${definition.label} konnte nicht gesendet werden.`);
      } finally {
        activeCommandRef.current = null;
        inFlightRef.current = false;
        setSending(false);

        if (pendingColorRef.current !== null) {
          scheduleFlush(SLIDER_COMMAND_THROTTLE_MS);
        }
      }
    },
    [definition.itemRefs.colorItemName, definition.label, scheduleFlush]
  );

  useEffect(() => {
    flushPendingColorRef.current = () => {
      if (inFlightRef.current) {
        return;
      }

      const nextColor = pendingColorRef.current;
      if (nextColor === null) {
        return;
      }

      pendingColorRef.current = null;
      void sendColorNow(nextColor);
    };
  }, [sendColorNow]);

  const queueColor = useCallback(
    (nextColor: HsbColor, force = false) => {
      setOptimisticColor(nextColor);
      pendingColorRef.current = nextColor;

      if (force && throttleTimerRef.current !== null) {
        window.clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }

      if (force) {
        flushPendingColorRef.current();
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

  const sendColor = (nextColor: HsbColor) => {
    queueColor(nextColor, true);
  };

  const toggle = () => {
    sendColor(createToggleColor(color));
  };

  const setHue = (hue: number, force = false) => {
    queueColor({ ...color, hue }, force);
  };

  const setSaturation = (saturation: number, force = false) => {
    queueColor({ ...color, saturation }, force);
  };

  const setBrightness = (brightness: number, force = false) => {
    queueColor({ ...color, brightness }, force);
  };

  return {
    rawState,
    color,
    cssColor,
    isOn,
    sending,
    toggle,
    setHue,
    setSaturation,
    setBrightness,
  };
};
