import { useRef, type PointerEvent } from "react";
import {
  isPrimaryPointer,
  releasePointerCaptureSafely,
  setPointerCaptureSafely,
} from "../pointerGestures";

const SLIDER_COLUMN_CLASS =
  "pointer-events-auto relative h-full min-h-0 touch-none select-none overflow-hidden rounded-2xl border border-ui-border-subtle shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-55";
const CHANNEL_BAR_CLASS =
  "pointer-events-none absolute left-3 right-3 rounded-full border border-white/80 bg-white/85 shadow-[0_0_22px_rgba(255,255,255,0.8)]";
const CHANNEL_BAR_HEIGHT_PX = 28;

interface VerticalChannelSliderProps {
  label: string;
  testId: string;
  value: number;
  min: number;
  max: number;
  background: string;
  disabled: boolean;
  onChange: (value: number, force?: boolean) => void;
}

const valueFromPointerEvent = (
  event: PointerEvent<HTMLElement>,
  min: number,
  max: number
): number => {
  const rect = event.currentTarget.getBoundingClientRect();
  const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
  const ratio = rect.height === 0 ? 0 : 1 - y / rect.height;
  return Math.round(min + ratio * (max - min));
};

const positionPercentForValue = (value: number, min: number, max: number): number => {
  const range = max - min;
  if (range === 0) {
    return 100;
  }
  const normalized = Math.min(Math.max((value - min) / range, 0), 1);
  return (1 - normalized) * 100;
};

export const VerticalChannelSlider = ({
  label,
  testId,
  value,
  min,
  max,
  background,
  disabled,
  onChange,
}: VerticalChannelSliderProps) => {
  const activePointerIdRef = useRef<number | null>(null);
  const handleTopPercent = positionPercentForValue(value, min, max);

  const updateValueFromPointer = (
    event: PointerEvent<HTMLElement>,
    force = false
  ): void => {
    if (disabled) {
      return;
    }
    onChange(valueFromPointerEvent(event, min, max), force);
  };

  return (
    <button
      type="button"
      role="slider"
      data-testid={testId}
      disabled={disabled}
      onPointerDown={(event) => {
        if (disabled || !isPrimaryPointer(event)) {
          return;
        }
        activePointerIdRef.current = event.pointerId;
        setPointerCaptureSafely(event.currentTarget, event.pointerId);
        updateValueFromPointer(event);
      }}
      onPointerMove={(event) => {
        if (
          activePointerIdRef.current !== event.pointerId ||
          (event.pointerType === "mouse" && event.buttons !== 1)
        ) {
          return;
        }
        updateValueFromPointer(event);
      }}
      onPointerUp={(event) => {
        if (activePointerIdRef.current !== event.pointerId) {
          return;
        }
        updateValueFromPointer(event, true);
        activePointerIdRef.current = null;
        releasePointerCaptureSafely(event.currentTarget, event.pointerId);
      }}
      onPointerCancel={(event) => {
        if (activePointerIdRef.current !== event.pointerId) {
          return;
        }
        activePointerIdRef.current = null;
        releasePointerCaptureSafely(event.currentTarget, event.pointerId);
      }}
      className={SLIDER_COLUMN_CLASS}
      style={{ background }}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span
        data-testid={`${testId}-handle`}
        className={CHANNEL_BAR_CLASS}
        style={{
          top: `clamp(${CHANNEL_BAR_HEIGHT_PX / 2}px, ${handleTopPercent}%, calc(100% - ${
            CHANNEL_BAR_HEIGHT_PX / 2
          }px))`,
          height: CHANNEL_BAR_HEIGHT_PX,
          transform: "translateY(-50%)",
        }}
      />
    </button>
  );
};
