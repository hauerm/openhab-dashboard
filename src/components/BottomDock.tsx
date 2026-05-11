import { useCallback, useEffect, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useViewStore } from "../stores/viewStore";
import type { ViewId } from "../types/view";
import LocationDockButton from "./LocationDockButton";
import { useLocationDockItems } from "./locationDockModel";
import { getSiblingViewId } from "./locationSiblingNavigation";
import {
  POINTER_HORIZONTAL_SWIPE_FACTOR,
  POINTER_SWIPE_MIN_DISTANCE_PX,
  POINTER_TAP_TOLERANCE_PX,
  getPointerTargetElement,
  isInteractiveTarget,
  isPrimaryPointer,
} from "../views/pointerGestures";

interface BottomDockProps {
  onViewChange?: (viewId: ViewId) => void;
}

const SCROLL_EDGE_EPSILON = 2;
const MIN_SCROLL_STEP = 240;
const MAX_SCROLL_STEP = 420;
const SCROLL_STEP_FACTOR = 0.82;
const AUTO_HIDE_DELAY_MS = 7000;
const EDGE_FADE_WIDTH_CLASS = "w-16 sm:w-20 md:w-24";
const SCROLL_CONTENT_INSET_CLASS = "px-16 sm:px-20 md:px-24";
const EDGE_FADE_BASE_CLASS =
  "pointer-events-none absolute inset-y-0 z-10 transition-opacity duration-300";
const EDGE_BUTTON_BASE_CLASS =
  "pointer-events-auto absolute top-1/2 z-20 -translate-y-1/2 rounded-full border border-ui-border-subtle bg-ui-surface-overlay/95 p-1.5 text-ui-foreground shadow-lg backdrop-blur-sm transition";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

interface ViewportGestureState {
  pointerId: number;
  startX: number;
  startY: number;
  handledSwipe: boolean;
}

const resetHorizontalScroll = (container: HTMLDivElement | null): void => {
  if (!container) {
    return;
  }

  if (typeof container.scrollTo === "function") {
    container.scrollTo({ left: 0, behavior: "auto" });
    return;
  }

  container.scrollLeft = 0;
};

const BottomDock = ({ onViewChange }: BottomDockProps) => {
  const currentView = useViewStore((state) => state.currentView);
  const setCurrentView = useViewStore((state) => state.setCurrentView);
  const model = useViewStore((state) => state.model);
  const dockItems = useLocationDockItems();
  const [isDockVisible, setIsDockVisible] = useState(true);
  const dockRootRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const viewportGestureRef = useRef<ViewportGestureState | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const dockItemsSignature = dockItems.map((item) => item.viewId).join("|");

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      setIsOverflowing(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const overflowing = maxScrollLeft > SCROLL_EDGE_EPSILON;
    const clampedScrollLeft = clamp(container.scrollLeft, 0, maxScrollLeft);

    setIsOverflowing(overflowing);
    setCanScrollLeft(clampedScrollLeft > SCROLL_EDGE_EPSILON);
    setCanScrollRight(clampedScrollLeft < maxScrollLeft - SCROLL_EDGE_EPSILON);
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleDockAutoHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setIsDockVisible(false);
    }, AUTO_HIDE_DELAY_MS);
  }, [clearHideTimer]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      updateScrollState();
    });

    const handleScrollOrResize = () => {
      updateScrollState();
    };

    container.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleScrollOrResize);
      resizeObserver.observe(container);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      container.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      resizeObserver?.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      resetHorizontalScroll(scrollContainerRef.current);
      updateScrollState();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [currentView, dockItemsSignature, isDockVisible, updateScrollState]);

  useEffect(() => {
    if (!isDockVisible) {
      return;
    }

    scheduleDockAutoHide();
    return clearHideTimer;
  }, [clearHideTimer, currentView, isDockVisible, scheduleDockAutoHide]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  const showDock = useCallback(() => {
    setIsDockVisible(true);
    scheduleDockAutoHide();
  }, [scheduleDockAutoHide]);

  const toggleDockFromViewport = useCallback(() => {
    if (isDockVisible) {
      clearHideTimer();
      setIsDockVisible(false);
      return;
    }

    showDock();
  }, [clearHideTimer, isDockVisible, showDock]);

  const getSiblingView = useCallback(
    (direction: "previous" | "next"): ViewId | null => {
      return getSiblingViewId(model, currentView, direction);
    },
    [currentView, model]
  );

  const handleViewportSwipe = useCallback(
    (direction: "previous" | "next"): boolean => {
      const targetView = getSiblingView(direction);
      if (!targetView) {
        return false;
      }

      onViewChange?.(targetView);
      setCurrentView(targetView);
      clearHideTimer();
      setIsDockVisible(false);
      return true;
    },
    [clearHideTimer, getSiblingView, onViewChange, setCurrentView]
  );

  useEffect(() => {
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (!isPrimaryPointer(event)) {
        return;
      }

      const dockRoot = dockRootRef.current;
      const targetElement = getPointerTargetElement(event.target);
      if (!targetElement) {
        return;
      }
      if (dockRoot?.contains(targetElement)) {
        return;
      }
      if (isInteractiveTarget(targetElement)) {
        return;
      }

      viewportGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        handledSwipe: false,
      };
    };

    const handleDocumentPointerMove = (event: PointerEvent) => {
      const gesture = viewportGestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId || gesture.handledSwipe) {
        return;
      }

      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (
        absX < POINTER_SWIPE_MIN_DISTANCE_PX ||
        absX < absY * POINTER_HORIZONTAL_SWIPE_FACTOR
      ) {
        return;
      }

      gesture.handledSwipe = true;
      handleViewportSwipe(deltaX < 0 ? "next" : "previous");
    };

    const handleDocumentPointerUp = (event: PointerEvent) => {
      const gesture = viewportGestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) {
        return;
      }

      viewportGestureRef.current = null;
      if (gesture.handledSwipe) {
        return;
      }

      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      if (
        Math.hypot(deltaX, deltaY) <= POINTER_TAP_TOLERANCE_PX
      ) {
        toggleDockFromViewport();
      }
    };

    const handleDocumentPointerCancel = (event: PointerEvent) => {
      if (viewportGestureRef.current?.pointerId === event.pointerId) {
        viewportGestureRef.current = null;
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown, {
      capture: true,
    });
    document.addEventListener("pointermove", handleDocumentPointerMove, {
      capture: true,
    });
    document.addEventListener("pointerup", handleDocumentPointerUp, {
      capture: true,
    });
    document.addEventListener("pointercancel", handleDocumentPointerCancel, {
      capture: true,
    });
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown, {
        capture: true,
      });
      document.removeEventListener("pointermove", handleDocumentPointerMove, {
        capture: true,
      });
      document.removeEventListener("pointerup", handleDocumentPointerUp, {
        capture: true,
      });
      document.removeEventListener("pointercancel", handleDocumentPointerCancel, {
        capture: true,
      });
    };
  }, [handleViewportSwipe, toggleDockFromViewport]);

  const scrollByDirection = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const scrollStep = Math.max(
      MIN_SCROLL_STEP,
      Math.min(MAX_SCROLL_STEP, Math.round(container.clientWidth * SCROLL_STEP_FACTOR))
    );
    container.scrollBy({
      left: direction === "left" ? -scrollStep : scrollStep,
      behavior: "smooth",
    });
    scheduleDockAutoHide();
  }, [scheduleDockAutoHide]);

  const handleDockInteraction = useCallback(() => {
    if (!isDockVisible) {
      return;
    }
    scheduleDockAutoHide();
  }, [isDockVisible, scheduleDockAutoHide]);

  const dockPanelClassName = `transition-all duration-500 ease-out ${
    isDockVisible
      ? "translate-y-0 opacity-100"
      : "pointer-events-none translate-y-full opacity-0"
  }`;

  return (
    <div ref={dockRootRef} className="fixed inset-x-0 bottom-0 z-40">
      <div
        data-testid="bottom-dock-panel"
        data-visible={isDockVisible ? "true" : "false"}
        className={dockPanelClassName}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ui-surface-shell via-ui-surface-overlay to-transparent" />

        <div className="relative">
          {isOverflowing ? (
            <>
              <div
                aria-hidden="true"
                className={`${EDGE_FADE_BASE_CLASS} ${EDGE_FADE_WIDTH_CLASS} left-0 bg-gradient-to-r from-ui-surface-shell via-ui-surface-shell/90 to-transparent ${
                  canScrollLeft ? "opacity-100" : "opacity-75"
                }`}
              />
              <div
                aria-hidden="true"
                className={`${EDGE_FADE_BASE_CLASS} ${EDGE_FADE_WIDTH_CLASS} right-0 bg-gradient-to-l from-ui-surface-shell via-ui-surface-shell/90 to-transparent ${
                  canScrollRight ? "opacity-100" : "opacity-75"
                }`}
              />
            </>
          ) : null}

          <div
            ref={scrollContainerRef}
            onPointerDown={handleDockInteraction}
            className={`flex gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              isOverflowing ? SCROLL_CONTENT_INSET_CLASS : "justify-center px-4"
            }`}
            style={{ touchAction: "pan-x" }}
          >
            {dockItems.map((item) => (
              <LocationDockButton
                key={item.viewId}
                item={item}
                className="h-32 aspect-[4/3] md:h-40"
                onClick={({ viewId }) => {
                  onViewChange?.(viewId);
                  setCurrentView(viewId);
                  clearHideTimer();
                  setIsDockVisible(false);
                }}
              />
            ))}
          </div>

          {isOverflowing && (
            <>
              <button
                type="button"
                data-testid="dock-scroll-left"
                aria-label="Thumbnails nach links scrollen"
                onClick={() => scrollByDirection("left")}
                disabled={!canScrollLeft}
                className={`${EDGE_BUTTON_BASE_CLASS} left-2 ${
                  canScrollLeft
                    ? "opacity-100 hover:bg-ui-surface-panel"
                    : "cursor-default opacity-55"
                }`}
              >
                <MdChevronLeft className="h-10 w-10" />
              </button>
              <button
                type="button"
                data-testid="dock-scroll-right"
                aria-label="Thumbnails nach rechts scrollen"
                onClick={() => scrollByDirection("right")}
                disabled={!canScrollRight}
                className={`${EDGE_BUTTON_BASE_CLASS} right-2 ${
                  canScrollRight
                    ? "opacity-100 hover:bg-ui-surface-panel"
                    : "cursor-default opacity-55"
                }`}
              >
                <MdChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default BottomDock;
