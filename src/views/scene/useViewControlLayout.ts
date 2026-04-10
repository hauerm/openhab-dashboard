import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { toast } from "react-toastify";
import { fetchItemMetadata, upsertItemMetadata } from "../../services/openhab-service";
import { log } from "../../services/logger";
import type { ViewId } from "../../types/scene";

const logger = log.createLogger("ViewControlLayout");

export interface ViewControlPosition {
  x: number;
  y: number;
}

export interface ViewControlDescriptor {
  controlId: string;
  metadataItemNames: string[];
  defaultPosition: ViewControlPosition;
}

interface UseViewControlLayoutOptions {
  viewId: ViewId;
  controls: ViewControlDescriptor[];
  dragEnabled: boolean;
}

interface DragState {
  controlId: string;
  metadataItemNames: string[];
  pointerId: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const parsePositionValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clamp(value, 0, 100);
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return clamp(parsed, 0, 100);
    }
  }
  return null;
};

const normalizeMetadataItemNames = (itemNames: string[]): string[] =>
  Array.from(
    new Set(
      itemNames
        .map((itemName) => itemName.trim())
        .filter((itemName) => itemName.length > 0)
    )
  );

export const useViewControlLayout = ({
  viewId,
  controls,
  dragEnabled,
}: UseViewControlLayoutOptions) => {
  const metadataNamespace = `dashboard-layout-${viewId}`;
  const controlsSnapshot = useMemo(
    () =>
      controls.map((control) => ({
        controlId: control.controlId,
        metadataItemNames: normalizeMetadataItemNames(control.metadataItemNames),
        defaultPosition: {
          x: control.defaultPosition.x,
          y: control.defaultPosition.y,
        },
      })),
    [controls]
  );
  const controlsSignature = useMemo(
    () => JSON.stringify(controlsSnapshot),
    [controlsSnapshot]
  );
  const canonicalControls = useMemo(
    () => JSON.parse(controlsSignature) as ViewControlDescriptor[],
    [controlsSignature]
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlRefs = useRef(new Map<string, HTMLDivElement>());
  const dragStateRef = useRef<DragState | null>(null);

  const defaultsByControlId = useMemo(() => {
    const next: Record<string, ViewControlPosition> = {};
    for (const control of canonicalControls) {
      next[control.controlId] = control.defaultPosition;
    }
    return next;
  }, [canonicalControls]);

  const [positions, setPositions] = useState<Record<string, ViewControlPosition>>(
    defaultsByControlId
  );
  const positionsRef = useRef(positions);

  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      const loadedPositions: Record<string, ViewControlPosition> = {};

      await Promise.all(
        canonicalControls.map(async (control) => {
          for (const itemName of control.metadataItemNames) {
            try {
              const metadata = await fetchItemMetadata(itemName, metadataNamespace);
              if (!metadata?.config) {
                continue;
              }

              const x = parsePositionValue(metadata.config.x);
              const y = parsePositionValue(metadata.config.y);
              if (x === null || y === null) {
                continue;
              }

              loadedPositions[control.controlId] = { x, y };
              break;
            } catch (error) {
              logger.warn(
                `Failed to load ${metadataNamespace} for ${itemName}:`,
                error
              );
            }
          }
        })
      );

      if (!cancelled && Object.keys(loadedPositions).length > 0) {
        setPositions((current) => ({ ...current, ...loadedPositions }));
      }
    };

    void loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [canonicalControls, metadataNamespace]);

  const setControlElementRef = useCallback(
    (controlId: string) => (node: HTMLDivElement | null) => {
      if (node) {
        controlRefs.current.set(controlId, node);
      } else {
        controlRefs.current.delete(controlId);
      }
    },
    []
  );

  const updateControlPosition = useCallback(
    (controlId: string, clientX: number, clientY: number) => {
      const container = containerRef.current;
      const control = controlRefs.current.get(controlId);
      if (!container || !control) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const controlRect = control.getBoundingClientRect();
      if (containerRect.width <= 0 || containerRect.height <= 0) {
        return;
      }

      const halfWidthPercent = (controlRect.width / 2 / containerRect.width) * 100;
      const halfHeightPercent = (controlRect.height / 2 / containerRect.height) * 100;

      const x = clamp(
        ((clientX - containerRect.left) / containerRect.width) * 100,
        halfWidthPercent,
        100 - halfWidthPercent
      );
      const y = clamp(
        ((clientY - containerRect.top) / containerRect.height) * 100,
        halfHeightPercent,
        100 - halfHeightPercent
      );

      setPositions((current) => {
        const existing = current[controlId];
        if (existing && existing.x === x && existing.y === y) {
          return current;
        }
        return {
          ...current,
          [controlId]: { x, y },
        };
      });
    },
    []
  );

  const persistPosition = useCallback(
    async (controlId: string, metadataItemNames: string[]) => {
      const position = positionsRef.current[controlId];
      if (!position || metadataItemNames.length === 0) {
        return;
      }

      const persistencePayload = {
        value: "v1",
        config: {
          x: position.x.toFixed(2),
          y: position.y.toFixed(2),
        },
      };

      const persistenceResults = await Promise.allSettled(
        metadataItemNames.map(async (itemName) => {
          await upsertItemMetadata(itemName, metadataNamespace, persistencePayload);
        })
      );

      const rejectedIndices = persistenceResults
        .map((result, index) => ({ result, index }))
        .filter(
          (entry): entry is { result: PromiseRejectedResult; index: number } =>
            entry.result.status === "rejected"
        );

      if (rejectedIndices.length > 0) {
        for (const entry of rejectedIndices) {
          const itemName = metadataItemNames[entry.index] ?? "unknown-item";
          logger.error(
            `Failed to persist ${metadataNamespace} for ${itemName}:`,
            entry.result.reason
          );
        }
        toast.error("Control-Position konnte nicht gespeichert werden.");
      }
    },
    [metadataNamespace]
  );

  const handleControlPointerDown = useCallback(
    (
      controlId: string,
      metadataItemNames: string[],
      event: ReactPointerEvent<HTMLDivElement>
    ) => {
      if (!dragEnabled || event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStateRef.current = {
        controlId,
        metadataItemNames,
        pointerId: event.pointerId,
      };
      updateControlPosition(controlId, event.clientX, event.clientY);
    },
    [dragEnabled, updateControlPosition]
  );

  const handleControlPointerMove = useCallback(
    (controlId: string, event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragEnabled) {
        return;
      }

      const dragState = dragStateRef.current;
      if (
        !dragState ||
        dragState.controlId !== controlId ||
        dragState.pointerId !== event.pointerId
      ) {
        return;
      }

      event.preventDefault();
      updateControlPosition(controlId, event.clientX, event.clientY);
    },
    [dragEnabled, updateControlPosition]
  );

  const finishDrag = useCallback(
    (
      controlId: string,
      event: ReactPointerEvent<HTMLDivElement>,
      persist: boolean
    ) => {
      const dragState = dragStateRef.current;
      if (
        !dragState ||
        dragState.controlId !== controlId ||
        dragState.pointerId !== event.pointerId
      ) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      dragStateRef.current = null;
      if (persist) {
        void persistPosition(controlId, dragState.metadataItemNames);
      }
    },
    [persistPosition]
  );

  const handleControlPointerUp = useCallback(
    (controlId: string, event: ReactPointerEvent<HTMLDivElement>) => {
      finishDrag(controlId, event, true);
    },
    [finishDrag]
  );

  const handleControlPointerCancel = useCallback(
    (controlId: string, event: ReactPointerEvent<HTMLDivElement>) => {
      finishDrag(controlId, event, false);
    },
    [finishDrag]
  );

  const getControlPositionStyle = useCallback(
    (controlId: string): CSSProperties => {
      const position = positions[controlId] ?? defaultsByControlId[controlId] ?? { x: 50, y: 50 };
      return {
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      };
    },
    [defaultsByControlId, positions]
  );

  return {
    containerRef,
    setControlElementRef,
    getControlPositionStyle,
    handleControlPointerDown,
    handleControlPointerMove,
    handleControlPointerUp,
    handleControlPointerCancel,
  };
};
