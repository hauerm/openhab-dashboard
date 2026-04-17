import { useMemo, useState } from "react";
import { MdOutlineOpenWith } from "react-icons/md";
import { LightHudControl, LightOverlayControl } from "../../../controls/light";
import { PowerHudControl, PowerOverlayControl } from "../../../controls/power";
import {
  RaffstoreHudControl,
  RaffstoreOverlayControl,
} from "../../../controls/raffstore";
import { TvHudControl, TvOverlayControl } from "../../../controls/tv";
import type { ViewProps } from "../../../types";
import { useViewControlLayout } from "../../../useViewControlLayout";
import { useLivingViewModel } from "./useLivingViewModel";

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

const getLayoutWrapperClassName = (layoutEditMode: boolean): string =>
  `${HUD_WRAPPER_CLASS} ${layoutEditMode ? HUD_WRAPPER_DRAG_CLASS : ""}`;

const getLayoutToggleClassName = (layoutEditMode: boolean): string =>
  `${HUD_LAYOUT_TOGGLE_BASE_CLASS} ${
    layoutEditMode ? HUD_LAYOUT_TOGGLE_EDIT_CLASS : HUD_LAYOUT_TOGGLE_DEFAULT_CLASS
  }`;

const Living = ({
  activeControlId,
  onOpenControl,
  onCloseControl,
  blockedLeftPx = 0,
}: ViewProps) => {
  const controls = useLivingViewModel();
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
    viewId: "living",
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
            data-testid="living-layout-edit-toggle"
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

          <section data-testid="living-controls" className={HUD_LAYOUT_SECTION_CLASS}>
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
                {definition.controlType === "raffstore" ? (
                  <RaffstoreHudControl
                    definition={definition}
                    interactive={!layoutEditMode}
                    onOpenControl={onOpenControl}
                  />
                ) : definition.controlType === "light" ? (
                  <LightHudControl
                    definition={definition}
                    interactive={!layoutEditMode}
                    onOpenControl={onOpenControl}
                  />
                ) : definition.controlType === "tv" ? (
                  <TvHudControl
                    definition={definition}
                    interactive={!layoutEditMode}
                    onOpenControl={onOpenControl}
                  />
                ) : (
                  <PowerHudControl
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

      {activeControl?.controlType === "raffstore" ? (
        <RaffstoreOverlayControl
          definition={activeControl}
          onClose={onCloseControl}
        />
      ) : activeControl?.controlType === "light" ? (
        <LightOverlayControl definition={activeControl} onClose={onCloseControl} />
      ) : activeControl?.controlType === "tv" ? (
        <TvOverlayControl
          definition={activeControl}
          onClose={onCloseControl}
        />
      ) : activeControl?.controlType === "power" ? (
        <PowerOverlayControl
          definition={activeControl}
          onClose={onCloseControl}
        />
      ) : null}
    </>
  );
};

export default Living;
