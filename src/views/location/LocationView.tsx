import { useMemo, useState } from "react";
import { MdOutlineOpenWith } from "react-icons/md";
import { useViewStore } from "../../stores/viewStore";
import { LightHudControl, LightOverlayControl } from "../controls/light";
import { PowerHudControl, PowerOverlayControl } from "../controls/power";
import {
  RaffstoreHudControl,
  RaffstoreOverlayControl,
} from "../controls/raffstore";
import { TvHudControl, TvOverlayControl } from "../controls/tv";
import {
  VentilationHudControl,
  VentilationOverlayControl,
} from "../controls/ventilation";
import type { ViewControlDefinition } from "../controls/controlDefinitions";
import type { ViewProps } from "../types";
import { useViewControlLayout } from "../useViewControlLayout";

type LocationViewProps = ViewProps & {
  viewId: string;
};

const HUD_ROOT_CLASS = "pointer-events-none absolute inset-0 z-20";
const HUD_CONTAINER_CLASS = "relative h-full w-full";
const HUD_LAYOUT_SECTION_CLASS = "contents";
const HUD_WRAPPER_CLASS = "pointer-events-auto absolute touch-none select-none";
const HUD_WRAPPER_DRAG_CLASS = "cursor-grab active:cursor-grabbing";
const HUD_LAYOUT_TOGGLE_BASE_CLASS =
  "pointer-events-auto absolute right-1 top-1 z-30 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold uppercase tracking-wide transition md:text-sm";
const HUD_LAYOUT_TOGGLE_EDIT_CLASS =
  "border-ui-warning-border bg-ui-warning-solid text-ui-warning-foreground hover:brightness-110";
const HUD_LAYOUT_TOGGLE_DEFAULT_CLASS =
  "border-ui-border-strong bg-ui-surface-overlay text-ui-foreground hover:bg-ui-surface-panel";

const EMPTY_CONTROLS: readonly ViewControlDefinition[] = [];

const getLayoutWrapperClassName = (layoutEditMode: boolean): string =>
  `${HUD_WRAPPER_CLASS} ${layoutEditMode ? HUD_WRAPPER_DRAG_CLASS : ""}`;

const getLayoutToggleClassName = (layoutEditMode: boolean): string =>
  `${HUD_LAYOUT_TOGGLE_BASE_CLASS} ${
    layoutEditMode ? HUD_LAYOUT_TOGGLE_EDIT_CLASS : HUD_LAYOUT_TOGGLE_DEFAULT_CLASS
  }`;

const renderHudControl = (
  definition: ViewControlDefinition,
  layoutEditMode: boolean,
  onOpenControl: (controlId: string) => void
) => {
  if (definition.controlType === "opening") {
    return (
      <RaffstoreHudControl
        definition={definition}
        interactive={!layoutEditMode}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "light") {
    return (
      <LightHudControl
        definition={definition}
        interactive={!layoutEditMode}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "tv") {
    return (
      <TvHudControl
        definition={definition}
        interactive={!layoutEditMode}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "power") {
    return (
      <PowerHudControl
        definition={definition}
        interactive={!layoutEditMode}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "ventilation") {
    return (
      <VentilationHudControl
        definition={definition}
        interactive={!layoutEditMode}
        onOpenControl={onOpenControl}
      />
    );
  }
  return null;
};

const renderOverlayControl = (
  definition: ViewControlDefinition | null,
  onCloseControl: () => void
) => {
  if (!definition) {
    return null;
  }
  if (definition.controlType === "opening") {
    return <RaffstoreOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "light") {
    return <LightOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "tv") {
    return <TvOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "power") {
    return <PowerOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "ventilation") {
    return (
      <VentilationOverlayControl
        definition={definition}
        onClose={onCloseControl}
      />
    );
  }
  return null;
};

const LocationView = ({
  viewId,
  activeControlId,
  onOpenControl,
  onCloseControl,
  blockedLeftPx = 0,
}: LocationViewProps) => {
  const controls = useViewStore(
    (state) => state.model?.controlsByLocation[viewId] ?? EMPTY_CONTROLS
  );
  const [layoutEditMode, setLayoutEditMode] = useState(false);

  const layoutControls = useMemo(
    () =>
      controls.map((definition) => ({
        controlId: definition.controlId,
        metadataItemNames: [...definition.layoutMetadataItemNames],
        legacyMetadataItemNames: [
          ...(definition.legacyLayoutMetadataItemNames ?? []),
        ],
        defaultPosition: definition.defaultPosition,
      })),
    [controls]
  );

  const activeControl = useMemo(
    () =>
      activeControlId
        ? controls.find((definition) => definition.controlId === activeControlId) ??
          null
        : null,
    [activeControlId, controls]
  );

  const {
    containerRef,
    setControlElementRef,
    getControlPositionStyle,
    handleControlPointerDown,
    handleControlPointerMove,
    handleControlPointerUp,
    handleControlPointerCancel,
  } = useViewControlLayout({
    viewId,
    controls: layoutControls,
    dragEnabled: layoutEditMode,
    blockedLeftPx,
  });

  return (
    <>
      <div className={HUD_ROOT_CLASS}>
        <div ref={containerRef} className={HUD_CONTAINER_CLASS}>
          <button
            type="button"
            data-testid={`${viewId}-layout-edit-toggle`}
            className={getLayoutToggleClassName(layoutEditMode)}
            onClick={() => {
              setLayoutEditMode((current) => !current);
            }}
            aria-label={
              layoutEditMode
                ? "Layout-Bearbeitung beenden"
                : "Layout-Bearbeitung starten"
            }
          >
            <MdOutlineOpenWith className="h-4 w-4 md:h-5 md:w-5" />
            {layoutEditMode ? "Layout aktiv" : "Layout"}
          </button>

          <section data-testid={`${viewId}-controls`} className={HUD_LAYOUT_SECTION_CLASS}>
            {controls.map((definition) => (
              <div
                key={definition.controlId}
                ref={setControlElementRef(definition.controlId)}
                style={getControlPositionStyle(definition.controlId)}
                onPointerDown={(event) => {
                  handleControlPointerDown(
                    definition.controlId,
                    [...definition.layoutMetadataItemNames],
                    event
                  );
                }}
                onPointerMove={(event) => {
                  handleControlPointerMove(definition.controlId, event);
                }}
                onPointerUp={(event) => {
                  handleControlPointerUp(definition.controlId, event);
                }}
                onPointerCancel={(event) => {
                  handleControlPointerCancel(definition.controlId, event);
                }}
                className={getLayoutWrapperClassName(layoutEditMode)}
              >
                {renderHudControl(definition, layoutEditMode, onOpenControl)}
              </div>
            ))}
          </section>
        </div>
      </div>

      {renderOverlayControl(activeControl, onCloseControl)}
    </>
  );
};

export default LocationView;
