import type { PointerEvent as ReactPointerEvent } from "react";

export const POINTER_TAP_TOLERANCE_PX = 10;
export const POINTER_SWIPE_MIN_DISTANCE_PX = 50;
export const POINTER_HORIZONTAL_SWIPE_FACTOR = 1.4;

export const INTERACTIVE_POINTER_TARGET_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[role='link']",
  "[role='slider']",
  "[data-prevent-dock-open='true']",
  "[data-pointer-interactive='true']",
  "[data-testid='overlay-backdrop']",
  "[data-testid='overlay-close-area']",
].join(",");

type PointerLikeEvent = Pick<
  PointerEvent | ReactPointerEvent,
  "button" | "isPrimary" | "pointerType"
>;

export const isPrimaryPointer = (event: PointerLikeEvent): boolean => {
  if (!event.pointerType || event.pointerType === "mouse") {
    return event.button === 0;
  }
  return event.isPrimary !== false;
};

export const getPointerTargetElement = (
  target: EventTarget | null
): Element | null => {
  if (target instanceof Element) {
    return target;
  }
  if (target instanceof Node) {
    return target.parentElement;
  }
  return null;
};

export const isInteractiveTarget = (
  target: EventTarget | Element | null
): boolean => {
  const targetElement =
    target instanceof Element ? target : getPointerTargetElement(target);
  return Boolean(targetElement?.closest(INTERACTIVE_POINTER_TARGET_SELECTOR));
};

export const setPointerCaptureSafely = (
  element: Element,
  pointerId: number
): void => {
  if (!("setPointerCapture" in element)) {
    return;
  }

  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer capture can fail in tests or when the pointer is no longer active.
  }
};

export const releasePointerCaptureSafely = (
  element: Element,
  pointerId: number
): void => {
  if (!("hasPointerCapture" in element) || !("releasePointerCapture" in element)) {
    return;
  }

  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Ignore stale pointer capture state from browsers or DOM test environments.
  }
};
