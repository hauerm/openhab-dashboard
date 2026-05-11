import { MdDashboardCustomize } from "react-icons/md";
import type { ViewId } from "../types/view";
import {
  LocationPropertyStateBlock,
  LocationPropertyStateOverlay,
} from "./LocationPropertyStateBlocks";
import {
  getSidebarShapeClassName,
  type SidebarShape,
  useLocationPropertyStateBlocks,
} from "./locationPropertyStateBlocksModel";

export const VIEW_SIDEBAR_SAFE_ZONE_PX = 208;

interface ViewSidebarProps {
  viewId: ViewId;
  viewMode: "overview" | "location";
  activeControlId: string | null;
  onSetViewMode: (viewMode: "overview" | "location") => void;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
}

const ViewSidebar = ({
  viewId,
  viewMode,
  activeControlId,
  onSetViewMode,
  onOpenControl,
  onCloseControl,
}: ViewSidebarProps) => {
  const { entries, activeDefinition } = useLocationPropertyStateBlocks(
    viewId,
    activeControlId
  );
  const overviewShape: SidebarShape = entries.length === 0 ? "single" : "first";
  const firstMetricOffset = entries.length === 0 ? 0 : 1;

  return (
    <>
      <aside className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden items-center md:flex">
        <div className="pointer-events-auto max-h-[calc(100vh-1.5rem)] overflow-y-auto pr-4">
          <div
            data-testid="view-sidebar"
            className="flex w-44 flex-col shadow-2xl sm:w-48 md:w-52"
          >
            <button
              type="button"
              data-testid="view-sidebar-overview-toggle"
              onClick={() => {
                onSetViewMode(viewMode === "overview" ? "location" : "overview");
              }}
              aria-label={
                viewMode === "overview"
                  ? "Zur Location-Ansicht wechseln"
                  : "Zur Übersicht wechseln"
              }
              aria-pressed={viewMode === "overview"}
              title={viewMode === "overview" ? "Location-Ansicht" : "Übersicht"}
              className={`group flex min-h-20 w-full items-center justify-center border-r border-ui-border-subtle px-5 py-4 text-ui-foreground backdrop-blur-xl transition hover:brightness-110 ${getSidebarShapeClassName(
                overviewShape
              )} ${
                viewMode === "overview"
                  ? "bg-ui-surface-muted"
                  : "bg-ui-surface-overlay"
              }`}
            >
              <MdDashboardCustomize className="h-10 w-10 md:h-11 md:w-11" />
            </button>
            {entries.map((entry, index) => {
              const shape: SidebarShape =
                entries.length === 1 && firstMetricOffset === 0
                  ? "single"
                  : index + firstMetricOffset === 0
                  ? "first"
                  : index === entries.length - 1
                  ? "last"
                  : "middle";

              return (
                <LocationPropertyStateBlock
                  key={entry.definition.controlId}
                  entry={entry}
                  onOpenControl={onOpenControl}
                  shape={shape}
                />
              );
            })}
          </div>
        </div>
      </aside>

      <LocationPropertyStateOverlay
        activeDefinition={activeDefinition}
        onClose={onCloseControl}
      />
    </>
  );
};

export default ViewSidebar;
