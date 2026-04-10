import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  MdBlinds,
  MdBlindsClosed,
  MdEmojiObjects,
  MdOutlineLightbulb,
  MdOutlineOpenWith,
  MdWindow,
} from "react-icons/md";
import type { SceneViewHudProps } from "../../../types";
import { useViewControlLayout } from "../../../useViewControlLayout";
import { sendSceneItemCommand } from "../../../controls/sceneItemCommand";
import { useLivingViewStore } from "./useLivingViewStore";

const HUD_ICON_BY_STATE = {
  "raffstore-open": MdWindow,
  "raffstore-half": MdBlinds,
  "raffstore-closed": MdBlindsClosed,
  "light-on": MdEmojiObjects,
  "light-off": MdOutlineLightbulb,
} as const;

const HUD_LABEL_BY_KIND = {
  raffstore: "Raffstore öffnen",
  light: "Licht steuern",
} as const;

const HUD_ICON_CLASS_BY_STATE = {
  "raffstore-open": "text-white",
  "raffstore-half": "text-white",
  "raffstore-closed": "text-white",
  "light-on": "text-amber-100",
  "light-off": "text-white",
} as const;

const HUD_CIRCLE_BASE_CLASS =
  "pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24";

const HUD_CIRCLE_LIGHT_ON_CLASS =
  "bg-amber-100/70 shadow-[0_0_90px_28px_rgba(255,221,140,0.5)] hover:bg-amber-100/80";

const HUD_CIRCLE_LIGHT_OFF_CLASS = "bg-black/30 shadow-xl hover:bg-black/45";

const HUD_WRAPPER_CLASS =
  "pointer-events-auto absolute touch-none select-none";

const HUD_WRAPPER_DRAG_CLASS = "cursor-grab active:cursor-grabbing";

const HUD_ICON_CLASS = "h-10 w-10 md:h-12 md:w-12";

const HUD_ICON_CONTAINER_CLASS = "flex items-center justify-center";

const HUD_LAYOUT_TOGGLE_BASE_CLASS =
  "pointer-events-auto absolute right-1 top-1 z-30 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold uppercase tracking-wide transition md:text-sm";

const HUD_LAYOUT_TOGGLE_EDIT_CLASS =
  "border-amber-300/70 bg-amber-500/85 text-slate-900 hover:bg-amber-400";

const HUD_LAYOUT_TOGGLE_DEFAULT_CLASS =
  "border-white/35 bg-black/55 text-white hover:bg-black/70";

const HUD_ROOT_CLASS = "pointer-events-none absolute inset-0 z-20";
const HUD_CONTAINER_CLASS = "relative h-full w-full";

const HUD_LAYOUT_SECTION_CLASS = "contents";

const getLayoutWrapperClassName = (layoutEditMode: boolean): string =>
  `${HUD_WRAPPER_CLASS} ${layoutEditMode ? HUD_WRAPPER_DRAG_CLASS : ""}`;

const getLayoutToggleClassName = (layoutEditMode: boolean): string =>
  `${HUD_LAYOUT_TOGGLE_BASE_CLASS} ${
    layoutEditMode ? HUD_LAYOUT_TOGGLE_EDIT_CLASS : HUD_LAYOUT_TOGGLE_DEFAULT_CLASS
  }`;

const getHudAriaLabel = (label: string, kind: "raffstore" | "light"): string =>
  `${label} (${HUD_LABEL_BY_KIND[kind]})`;

const getHudIconClassName = (
  state:
    | "raffstore-open"
    | "raffstore-half"
    | "raffstore-closed"
    | "light-on"
    | "light-off"
): string => `${HUD_ICON_CLASS} ${HUD_ICON_CLASS_BY_STATE[state]}`;

const getHudCircleClassName = (
  state:
    | "raffstore-open"
    | "raffstore-half"
    | "raffstore-closed"
    | "light-on"
    | "light-off"
): string =>
  state === "light-on"
    ? `${HUD_CIRCLE_BASE_CLASS} ${HUD_CIRCLE_LIGHT_ON_CLASS}`
    : `${HUD_CIRCLE_BASE_CLASS} ${HUD_CIRCLE_LIGHT_OFF_CLASS}`;

const getHudIconTestId = (
  itemName: string,
  state:
    | "raffstore-open"
    | "raffstore-half"
    | "raffstore-closed"
    | "light-on"
    | "light-off"
): string => `living-control-placeholder-icon-${itemName}-${state}`;

const getHudButtonTestId = (itemName: string): string =>
  `living-control-placeholder-${itemName}`;

const getPositionControlId = (itemName: string): string => itemName;

const getDefaultPosition = (x: number, y: number): { x: number; y: number } => ({
  x,
  y,
});

const LivingHud = ({ onOpenOverlay }: SceneViewHudProps) => {
  const { controls } = useLivingViewStore();
  const [layoutEditMode, setLayoutEditMode] = useState(false);
  const [pendingToggleItemName, setPendingToggleItemName] = useState<string | null>(
    null
  );

  const layoutControls = useMemo(
    () =>
      controls.map((control) => ({
        controlId: getPositionControlId(control.itemName),
        metadataItemNames: [control.itemName],
        defaultPosition: getDefaultPosition(
          control.defaultPosition.x,
          control.defaultPosition.y
        ),
      })),
    [controls]
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
  });

  const handleDirectToggle = async (
    itemName: string,
    label: string,
    hudState: "light-on" | "light-off"
  ) => {
    if (pendingToggleItemName) {
      return;
    }

    const command = hudState === "light-on" ? "OFF" : "ON";
    try {
      setPendingToggleItemName(itemName);
      await sendSceneItemCommand(itemName, command, "OnOff");
    } catch (error) {
      void error;
      toast.error(`Lichtbefehl für ${label} konnte nicht gesendet werden.`);
    } finally {
      setPendingToggleItemName(null);
    }
  };

  return (
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
            layoutEditMode ? "Layout-Bearbeitung beenden" : "Layout-Bearbeitung starten"
          }
        >
          <MdOutlineOpenWith className="h-4 w-4 md:h-5 md:w-5" />
          {layoutEditMode ? "Layout aktiv" : "Layout"}
        </button>

        <section data-testid="living-controls" className={HUD_LAYOUT_SECTION_CLASS}>
          {controls.map((control) => {
            const Icon = HUD_ICON_BY_STATE[control.hudState];
            const controlId = getPositionControlId(control.itemName);
            const isDirectToggle =
              control.kind === "light" && control.interaction === "direct-toggle";
            const isTogglePending = pendingToggleItemName === control.itemName;

            return (
              <div
                key={control.itemName}
                ref={setControlElementRef(controlId)}
                style={getControlPositionStyle(controlId)}
                onPointerDown={(event) => {
                  handleControlPointerDown(controlId, [control.itemName], event);
                }}
                onPointerMove={(event) => {
                  handleControlPointerMove(controlId, event);
                }}
                onPointerUp={(event) => {
                  handleControlPointerUp(controlId, event);
                }}
                onPointerCancel={(event) => {
                  handleControlPointerCancel(controlId, event);
                }}
                className={getLayoutWrapperClassName(layoutEditMode)}
              >
                <button
                  type="button"
                  data-testid={getHudButtonTestId(control.itemName)}
                  disabled={isTogglePending}
                  onClick={() => {
                    if (layoutEditMode) {
                      return;
                    }
                    if (isDirectToggle) {
                      const lightHudState =
                        control.hudState === "light-on" ? "light-on" : "light-off";
                      void handleDirectToggle(
                        control.itemName,
                        control.label,
                        lightHudState
                      );
                      return;
                    }
                    onOpenOverlay(control.overlayId);
                  }}
                  className={HUD_ICON_CONTAINER_CLASS}
                  aria-label={getHudAriaLabel(control.label, control.kind)}
                >
                  <span className={getHudCircleClassName(control.hudState)}>
                    <Icon
                      data-testid={getHudIconTestId(control.itemName, control.hudState)}
                      className={getHudIconClassName(control.hudState)}
                    />
                  </span>
                </button>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default LivingHud;
