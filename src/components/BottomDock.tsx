import { useCallback, useEffect, useRef, useState } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdKeyboardArrowUp,
  MdSubdirectoryArrowLeft,
} from "react-icons/md";
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
const EDGE_FADE_WIDTH_CLASS = "w-16 sm:w-20 md:w-24";
const SCROLL_CONTENT_INSET_CLASS = "px-16 sm:px-20 md:px-24";
const EDGE_FADE_BASE_CLASS =
  "pointer-events-none absolute inset-y-0 z-10 transition-opacity duration-300";
const EDGE_BUTTON_BASE_CLASS =
  "pointer-events-auto absolute top-1/2 z-20 -translate-y-1/2 rounded-full border border-ui-border-subtle bg-ui-surface-overlay/95 p-1.5 text-ui-foreground shadow-lg backdrop-blur-sm transition";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

interface DockItem {
  viewId: ViewId;
  isParent: boolean;
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
  const viewConfigs = useViewStore((state) => state.viewConfigs);
  const viewLabels = useViewStore((state) => state.viewLabels);
  const model = useViewStore((state) => state.model);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const dockRootRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const dockItems = (() => {
    if (!model) {
      return [] as DockItem[];
    }

    const currentLocation = model.locationsByName.get(currentView);
    if (!currentLocation) {
      return [] as DockItem[];
    }

    const childLocationNames =
      model.childLocationNamesByParentName[currentView] ?? [];

    if (currentLocation.parentName === null) {
      return childLocationNames.map((viewId) => ({ viewId, isParent: false }));
    }

    const parentName = currentLocation.parentName;

    if (childLocationNames.length > 0) {
      return [
        { viewId: parentName, isParent: true },
        ...childLocationNames.map((viewId) => ({ viewId, isParent: false })),
      ];
    }

    const siblingLocationNames =
      model.childLocationNamesByParentName[parentName] ?? [];
    const parentLocation = model.locationsByName.get(parentName);

    if (!parentLocation || parentLocation.parentName === null) {
      return siblingLocationNames.map((viewId) => ({ viewId, isParent: false }));
    }

    return [
      { viewId: parentLocation.parentName, isParent: true },
      ...siblingLocationNames.map((viewId) => ({ viewId, isParent: false })),
    ];
  })();
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

  useEffect(() => {
    if (!isDockVisible) {
      return;
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const dockRoot = dockRootRef.current;
      if (!dockRoot || !(event.target instanceof Node)) {
        return;
      }
      if (dockRoot.contains(event.target)) {
        return;
      }

      clearHideTimer();
      setIsDockVisible(false);
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [clearHideTimer, isDockVisible]);

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
            onTouchStart={handleDockInteraction}
            className={`flex gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              isOverflowing ? SCROLL_CONTENT_INSET_CLASS : "justify-center px-4"
            }`}
            style={{ touchAction: "pan-x" }}
          >
            {dockItems.map(({ viewId, isParent }) => {
              const viewConfig = viewConfigs[viewId];
              if (!viewConfig) {
                return null;
              }
              const viewLabel = viewLabels[viewId] ?? viewConfig.label;
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
                  aria-label={
                    isParent
                      ? `Ebene hoch zu ${viewLabel}`
                      : `Wechsel zu ${viewLabel}`
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  <img
                    src={viewConfig.baseImage}
                    alt={`Thumbnail ${viewLabel}`}
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
                  {isParent ? (
                    <div className="absolute left-2 top-2 z-10 inline-flex items-center justify-center rounded-full bg-ui-surface-overlay/90 p-1.5 text-ui-foreground shadow-md backdrop-blur-sm">
                      <MdSubdirectoryArrowLeft
                        data-testid={`dock-parent-icon-${viewId}`}
                        className="h-5 w-5 md:h-6 md:w-6"
                      />
                    </div>
                  ) : null}
                  <div
                    className={`absolute inset-0 transition ${
                      isActive
                        ? "bg-ui-surface-image"
                        : "bg-ui-surface-image-strong group-hover:bg-ui-surface-image"
                    }`}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-ui-surface-image-strong px-3 py-1.5 text-sm font-semibold text-ui-foreground md:text-base">
                    {viewLabel}
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
