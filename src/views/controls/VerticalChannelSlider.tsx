import { useRef, type CSSProperties, type PointerEvent } from "react";
import {
  isPrimaryPointer,
  releasePointerCaptureSafely,
  setPointerCaptureSafely,
} from "../pointerGestures";

const SLIDER_COLUMN_CLASS =
  "pointer-events-auto slider-track-frame h-full min-h-0 touch-none select-none backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-55";
const SLIDER_ROW_CLASS =
  "pointer-events-auto slider-track-frame h-16 min-h-16 w-full touch-none select-none backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-55";
const CHANNEL_BAR_CLASS = "slider-thumb-roundbar";
const CHANNEL_ROW_BAR_CLASS = "slider-thumb-roundbar-horizontal";

interface VerticalChannelSliderProps {
  label: string;
  testId: string;
  value: number;
  min: number;
  max: number;
  trackClassName: string;
  style?: CSSProperties;
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
  trackClassName,
  style,
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
      style={style}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span
        data-testid={`${testId}-track`}
        aria-hidden="true"
        className={`slider-track-fill ${trackClassName}`}
      />
      <span
        data-testid={`${testId}-handle`}
        className={CHANNEL_BAR_CLASS}
        style={{
          top: `clamp(var(--spacing-slider-thumb-center-inset), ${handleTopPercent}%, calc(100% - var(--spacing-slider-thumb-center-inset)))`,
          transform: "translateY(-50%)",
        }}
      />
    </button>
  );
};

const horizontalValueFromPointerEvent = (
  event: PointerEvent<HTMLElement>,
  min: number,
  max: number
): number => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  const ratio = rect.width === 0 ? 0 : x / rect.width;
  return Math.round(min + ratio * (max - min));
};

const horizontalPositionPercentForValue = (
  value: number,
  min: number,
  max: number
): number => {
  const range = max - min;
  if (range === 0) {
    return 0;
  }
  return Math.min(Math.max((value - min) / range, 0), 1) * 100;
};

export const HorizontalChannelSlider = ({
  label,
  testId,
  value,
  min,
  max,
  trackClassName,
  style,
  disabled,
  onChange,
}: VerticalChannelSliderProps) => {
  const activePointerIdRef = useRef<number | null>(null);
  const handleLeftPercent = horizontalPositionPercentForValue(value, min, max);

  const updateValueFromPointer = (
    event: PointerEvent<HTMLElement>,
    force = false
  ): void => {
    if (disabled) {
      return;
    }
    onChange(horizontalValueFromPointerEvent(event, min, max), force);
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
      className={SLIDER_ROW_CLASS}
      style={style}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span
        data-testid={`${testId}-track`}
        aria-hidden="true"
        className={`slider-track-fill ${trackClassName}`}
      />
      <span
        data-testid={`${testId}-handle`}
        className={CHANNEL_ROW_BAR_CLASS}
        style={{
          left: `clamp(var(--spacing-slider-thumb-center-inset), ${handleLeftPercent}%, calc(100% - var(--spacing-slider-thumb-center-inset)))`,
          transform: "translateX(-50%)",
        }}
      />
    </button>
  );
};
