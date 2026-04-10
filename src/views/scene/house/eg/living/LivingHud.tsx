import { useMemo, useState } from "react";
import { MdOutlineOpenWith } from "react-icons/md";
import type { SceneViewHudProps } from "../../../types";
import LightControl from "../../../controls/LightControl";
import RaffstoreControl from "../../../controls/RaffstoreControl";
import { useViewControlLayout } from "../../../useViewControlLayout";
import { useLivingViewStore } from "./useLivingViewStore";

const DEFAULT_CONTROL_POSITIONS: Record<string, { x: number; y: number }> = {
  wohnzimmer: { x: 22, y: 22 },
  strasse: { x: 40, y: 22 },
  couch: { x: 75, y: 74 },
  tv: { x: 90, y: 74 },
};

const LivingHud = ({ onOpenOverlay }: SceneViewHudProps) => {
  void onOpenOverlay;
  const { raffstores, lights } = useLivingViewStore();
  const [layoutEditMode, setLayoutEditMode] = useState(false);

  const layoutControls = useMemo(
    () => [
      ...raffstores.map((control) => ({
        controlId: control.id,
        itemName: control.itemName,
        defaultPosition: DEFAULT_CONTROL_POSITIONS[control.id] ?? { x: 50, y: 50 },
      })),
      ...lights.map((control) => ({
        controlId: control.id,
        itemName: control.itemName,
        defaultPosition: DEFAULT_CONTROL_POSITIONS[control.id] ?? { x: 50, y: 50 },
      })),
    ],
    [lights, raffstores]
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

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-4 md:p-6">
      <div ref={containerRef} className="relative mx-auto h-full max-w-6xl">
        <button
          type="button"
          data-testid="living-layout-edit-toggle"
          className={`pointer-events-auto absolute right-1 top-1 z-30 flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold uppercase tracking-wide transition md:text-sm ${
            layoutEditMode
              ? "border-amber-300/70 bg-amber-500/85 text-slate-900 hover:bg-amber-400"
              : "border-white/35 bg-black/55 text-white hover:bg-black/70"
          }`}
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

        <section data-testid="living-raffstore-controls" className="contents">
          {raffstores.map((raffstore) => (
            <div
              key={raffstore.id}
              ref={setControlElementRef(raffstore.id)}
              style={getControlPositionStyle(raffstore.id)}
              onPointerDown={(event) => {
                handleControlPointerDown(raffstore.id, raffstore.itemName, event);
              }}
              onPointerMove={(event) => {
                handleControlPointerMove(raffstore.id, event);
              }}
              onPointerUp={(event) => {
                handleControlPointerUp(raffstore.id, event);
              }}
              onPointerCancel={(event) => {
                handleControlPointerCancel(raffstore.id, event);
              }}
              className={`pointer-events-auto absolute touch-none select-none ${
                layoutEditMode ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              <RaffstoreControl
                controlId={raffstore.id}
                label={raffstore.label}
                itemName={raffstore.itemName}
                openingRawState={raffstore.openingRawState}
                disabled={layoutEditMode}
              />
            </div>
          ))}
        </section>

        <section data-testid="living-light-controls" className="contents">
          {lights.map((light) => (
            <div
              key={light.id}
              ref={setControlElementRef(light.id)}
              style={getControlPositionStyle(light.id)}
              onPointerDown={(event) => {
                handleControlPointerDown(light.id, light.itemName, event);
              }}
              onPointerMove={(event) => {
                handleControlPointerMove(light.id, event);
              }}
              onPointerUp={(event) => {
                handleControlPointerUp(light.id, event);
              }}
              onPointerCancel={(event) => {
                handleControlPointerCancel(light.id, event);
              }}
              className={`pointer-events-auto absolute touch-none select-none ${
                layoutEditMode ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              <LightControl
                controlId={light.id}
                label={light.label}
                itemName={light.itemName}
                rawState={light.rawState}
                disabled={layoutEditMode}
              />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default LivingHud;
