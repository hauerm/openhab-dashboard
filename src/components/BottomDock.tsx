import { useCallback, useEffect, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdKeyboardArrowUp } from "react-icons/md";
import { VIEW_IDS, VIEWS } from "../config/views";
import { useViewStore } from "../stores/viewStore";
import type { ViewId } from "../types/view";

interface BottomDockProps {
  onViewChange?: (viewId: ViewId) => void;
}

const SCROLL_EDGE_EPSILON = 2;
const MIN_SCROLL_STEP = 240;
const MAX_SCROLL_STEP = 420;
const SCROLL_STEP_FACTOR = 0.82;
const AUTO_HIDE_DELAY_MS = 7000;

const BottomDock = ({ onViewChange }: BottomDockProps) => {
  const currentView = useViewStore((state) => state.currentView);
  const setCurrentView = useViewStore((state) => state.setCurrentView);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

    setIsOverflowing(overflowing);
    setCanScrollLeft(container.scrollLeft > SCROLL_EDGE_EPSILON);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - SCROLL_EDGE_EPSILON);
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
    if (!isDockVisible) {
      return;
    }

    scheduleDockAutoHide();
    return clearHideTimer;
  }, [clearHideTimer, currentView, isDockVisible, scheduleDockAutoHide]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

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

  const showDock = useCallback(() => {
    setIsDockVisible(true);
    scheduleDockAutoHide();
  }, [scheduleDockAutoHide]);

  const handleDockInteraction = useCallback(() => {
    if (!isDockVisible) {
      return;
    }
    scheduleDockAutoHide();
  }, [isDockVisible, scheduleDockAutoHide]);

  const hideDock = useCallback(() => {
    clearHideTimer();
    setIsDockVisible(false);
  }, [clearHideTimer]);

  const dockPanelClassName = `transition-all duration-500 ease-out ${
    isDockVisible
      ? "translate-y-0 opacity-100"
      : "pointer-events-none translate-y-full opacity-0"
  }`;

  const dockToggleClassName = `pointer-events-auto absolute bottom-2 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out ${
    isDockVisible
      ? "pointer-events-none translate-y-2 opacity-0"
      : "translate-y-0 opacity-100"
  }`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className={dockPanelClassName}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ui-surface-shell via-ui-surface-overlay to-transparent" />

        <div className="relative">
          <div
            ref={scrollContainerRef}
            onPointerDown={handleDockInteraction}
            onTouchStart={handleDockInteraction}
            className={`flex gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              isOverflowing ? "" : "justify-center"
            }`}
            style={{ touchAction: "pan-x" }}
          >
            {VIEW_IDS.map((viewId) => {
              const viewConfig = VIEWS[viewId];
              const isActive = currentView === viewId;

              return (
                <button
                  key={viewId}
                  type="button"
                  data-testid={`dock-button-${viewId}`}
                  onClick={() => {
                    onViewChange?.(viewId);
                    setCurrentView(viewId);
                    showDock();
                  }}
                  className="group relative h-32 aspect-[4/3] shrink-0 overflow-hidden bg-ui-surface-panel text-left transition md:h-40"
                  aria-label={`Wechsel zu ${viewConfig.label}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <img
                    src={viewConfig.baseImage}
                    alt={`Thumbnail ${viewConfig.label}`}
                    className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                    draggable={false}
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallback === "1") {
                        return;
                      }
                      event.currentTarget.dataset.fallback = "1";
                      event.currentTarget.src = "/views/missing.jpg";
                    }}
                  />
                  <div
                    className={`absolute inset-0 transition ${
                      isActive
                        ? "bg-ui-surface-image"
                        : "bg-ui-surface-image-strong group-hover:bg-ui-surface-image"
                    }`}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-ui-surface-image-strong px-3 py-1.5 text-sm font-semibold text-ui-foreground md:text-base">
                    {viewConfig.label}
                  </div>
                  <div
                    className={`absolute inset-x-0 bottom-0 h-1 transition ${
                      isActive
                        ? "bg-ui-foreground"
                        : "bg-transparent group-hover:bg-ui-border-strong"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {isOverflowing && (
            <>
              <button
                type="button"
                data-testid="dock-scroll-left"
                aria-label="Thumbnails nach links scrollen"
                onClick={() => scrollByDirection("left")}
                className={`pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ui-surface-image-strong p-1.5 text-ui-foreground shadow-lg transition ${
                  canScrollLeft ? "opacity-100 hover:bg-ui-surface-panel" : "opacity-40"
                }`}
              >
                <MdChevronLeft className="h-10 w-10" />
              </button>
              <button
                type="button"
                data-testid="dock-scroll-right"
                aria-label="Thumbnails nach rechts scrollen"
                onClick={() => scrollByDirection("right")}
                className={`pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ui-surface-image-strong p-1.5 text-ui-foreground shadow-lg transition ${
                  canScrollRight ? "opacity-100 hover:bg-ui-surface-panel" : "opacity-40"
                }`}
              >
                <MdChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

          <button
            type="button"
            data-testid="dock-hide-button"
            aria-label="Dock ausblenden"
            onClick={hideDock}
            className="pointer-events-auto absolute bottom-1 right-2 rounded-sm bg-ui-surface-overlay px-2 py-1 text-xs font-medium text-ui-foreground-muted transition hover:bg-ui-surface-panel hover:text-ui-foreground"
          >
            Ausblenden
          </button>
        </div>
      </div>

      <button
        type="button"
        data-testid="dock-expand-button"
        aria-label="Dock einblenden"
        onClick={showDock}
        className={dockToggleClassName}
      >
        <span className="inline-flex items-center justify-center rounded-sm bg-ui-surface-overlay px-1 text-ui-foreground transition hover:bg-ui-surface-panel">
          <MdKeyboardArrowUp className="h-9 w-9" />
        </span>
      </button>
    </div>
  );
};

export default BottomDock;
