import { useMemo, useState } from "react";
import { MdOutlineOpenWith } from "react-icons/md";
import {
  LocationPropertyHistoryHudControl,
  LocationPropertyHistoryOverlayControl,
} from "../../controls/location-property-history";
import {
  VentilationHudControl,
  VentilationOverlayControl,
} from "../../controls/ventilation";
import type { SceneViewProps } from "../../types";
import { useViewControlLayout } from "../../useViewControlLayout";
import { useEgViewModel } from "./useEgViewModel";

const HUD_ROOT_CLASS = "pointer-events-none absolute inset-0 z-20";
const HUD_CONTAINER_CLASS = "relative h-full w-full";
const HUD_LAYOUT_SECTION_CLASS = "contents";
const HUD_WRAPPER_CLASS = "pointer-events-auto absolute touch-none select-none";
const HUD_WRAPPER_DRAG_CLASS = "cursor-grab active:cursor-grabbing";
const HUD_LAYOUT_TOGGLE_BASE_CLASS =
  "pointer-events-auto absolute right-1 top-1 z-30 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold uppercase tracking-wide transition md:text-sm";
const HUD_LAYOUT_TOGGLE_EDIT_CLASS =
  "border-amber-300/70 bg-amber-500/85 text-slate-900 hover:bg-amber-400";
const HUD_LAYOUT_TOGGLE_DEFAULT_CLASS =
  "border-white/35 bg-black/55 text-white hover:bg-black/70";

const getLayoutWrapperClassName = (layoutEditMode: boolean): string =>
  `${HUD_WRAPPER_CLASS} ${layoutEditMode ? HUD_WRAPPER_DRAG_CLASS : ""}`;

const getLayoutToggleClassName = (layoutEditMode: boolean): string =>
  `${HUD_LAYOUT_TOGGLE_BASE_CLASS} ${
    layoutEditMode ? HUD_LAYOUT_TOGGLE_EDIT_CLASS : HUD_LAYOUT_TOGGLE_DEFAULT_CLASS
  }`;

const Eg = ({ activeControlId, onOpenControl, onCloseControl }: SceneViewProps) => {
  const controls = useEgViewModel();
  const [layoutEditMode, setLayoutEditMode] = useState(false);

  const layoutControls = useMemo(
    () =>
      controls.map((definition) => ({
        controlId: definition.controlId,
        metadataItemNames: [...definition.layoutMetadataItemNames],
        defaultPosition: definition.defaultPosition,
      })),
    [controls]
  );

  const activeControl = useMemo(
    () =>
      activeControlId
        ? controls.find((definition) => definition.controlId === activeControlId) ?? null
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
    viewId: "eg",
    controls: layoutControls,
    dragEnabled: layoutEditMode,
  });

  return (
    <>
      <div className={HUD_ROOT_CLASS}>
        <div ref={containerRef} className={HUD_CONTAINER_CLASS}>
          <button
            type="button"
            data-testid="eg-layout-edit-toggle"
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

          <section className={HUD_LAYOUT_SECTION_CLASS}>
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
                {definition.controlType === "location-property-history" ? (
                  <LocationPropertyHistoryHudControl
                    definition={definition}
                    interactive={!layoutEditMode}
                    onOpenControl={onOpenControl}
                  />
                ) : (
                  <VentilationHudControl
                    definition={definition}
                    interactive={!layoutEditMode}
                    onOpenControl={onOpenControl}
                  />
                )}
              </div>
            ))}
          </section>
        </div>
      </div>

      {activeControl?.controlType === "location-property-history" ? (
        <LocationPropertyHistoryOverlayControl
          definition={activeControl}
          onClose={onCloseControl}
        />
      ) : activeControl?.controlType === "ventilation" ? (
        <VentilationOverlayControl
          definition={activeControl}
          onClose={onCloseControl}
        />
      ) : null}
    </>
  );
};

export default Eg;
