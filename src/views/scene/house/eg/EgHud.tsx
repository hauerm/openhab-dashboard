import { useMemo, useState } from "react";
import {
  MdCo2,
  MdHealthAndSafety,
  MdOutlineOpenWith,
  MdThermostat,
  MdWaterDrop,
} from "react-icons/md";
import VentilationControl from "../../controls/VentilationControl";
import type { SceneViewHudProps } from "../../types";
import { useViewControlLayout } from "../../useViewControlLayout";
import { useEgViewStore } from "./useEgViewStore";

const iconByMetricKey = {
  temperature: MdThermostat,
  humidity: MdWaterDrop,
  co2: MdCo2,
  "air-quality": MdHealthAndSafety,
} as const;

const testIdSuffixByMetricKey = {
  temperature: "temp",
  humidity: "humidity",
  co2: "co2",
  "air-quality": "health",
} as const;

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

const EgHud = ({ onOpenOverlay }: SceneViewHudProps) => {
  const { controls } = useEgViewStore();
  const [layoutEditMode, setLayoutEditMode] = useState(false);
  const textShadowClass = "[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]";

  const layoutControls = useMemo(
    () =>
      controls.map((control) => ({
        controlId: control.controlId,
        metadataItemNames: control.metadataItemNames,
        defaultPosition: control.defaultPosition,
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
    viewId: "eg",
    controls: layoutControls,
    dragEnabled: layoutEditMode,
  });

  return (
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
            layoutEditMode ? "Layout-Bearbeitung beenden" : "Layout-Bearbeitung starten"
          }
        >
          <MdOutlineOpenWith className="h-4 w-4 md:h-5 md:w-5" />
          {layoutEditMode ? "Layout aktiv" : "Layout"}
        </button>

        <section className={HUD_LAYOUT_SECTION_CLASS}>
          {controls.map((control) => {
            const isLocationPropertyControl =
              control.kind === "location-property-history";
            const MetricIcon = isLocationPropertyControl
              ? iconByMetricKey[control.metricKey]
              : null;

            return (
              <div
                key={control.controlId}
                ref={setControlElementRef(control.controlId)}
                style={getControlPositionStyle(control.controlId)}
                onPointerDown={(event) => {
                  handleControlPointerDown(
                    control.controlId,
                    control.metadataItemNames,
                    event
                  );
                }}
                onPointerMove={(event) => {
                  handleControlPointerMove(control.controlId, event);
                }}
                onPointerUp={(event) => {
                  handleControlPointerUp(control.controlId, event);
                }}
                onPointerCancel={(event) => {
                  handleControlPointerCancel(control.controlId, event);
                }}
                className={getLayoutWrapperClassName(layoutEditMode)}
              >
                {isLocationPropertyControl ? (
                  <button
                    type="button"
                    data-testid={`hud-metric-${testIdSuffixByMetricKey[control.metricKey]}`}
                    onClick={() => {
                      if (layoutEditMode) {
                        return;
                      }
                      onOpenOverlay(control.overlayId);
                    }}
                    className="group flex items-center gap-3 rounded-xl px-1 py-1 text-left"
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${control.tint.container} ${control.tint.icon}`}
                    >
                      {MetricIcon ? <MetricIcon className="h-6 w-6" /> : null}
                    </span>
                    <span className="text-white">
                      <span
                        className={`block font-semibold leading-none ${
                          control.metricKey === "air-quality"
                            ? "text-2xl md:text-3xl"
                            : "text-3xl md:text-4xl"
                        } ${textShadowClass}`}
                      >
                        {control.value}
                      </span>
                      <span className={`block text-sm text-white/80 ${textShadowClass}`}>
                        {control.label}
                      </span>
                    </span>
                  </button>
                ) : (
                  <VentilationControl
                    variant="hud"
                    badge={control.badge}
                    onActivate={() => {
                      if (layoutEditMode) {
                        return;
                      }
                      onOpenOverlay(control.overlayId);
                    }}
                  />
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default EgHud;
