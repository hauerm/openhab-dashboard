import { MdSubdirectoryArrowLeft } from "react-icons/md";
import type { LocationDockItem } from "./locationDockModel";

interface LocationDockButtonProps {
  item: LocationDockItem;
  className: string;
  onClick: (item: LocationDockItem) => void;
}

const LocationDockButton = ({
  item,
  className,
  onClick,
}: LocationDockButtonProps) => (
  <button
    type="button"
    data-testid={`dock-button-${item.viewId}`}
    onClick={() => {
      onClick(item);
    }}
    className={`group relative shrink-0 overflow-hidden bg-ui-surface-panel text-left transition ${className}`}
    aria-label={
      item.isParent
        ? `Ebene hoch zu ${item.viewLabel}`
        : `Wechsel zu ${item.viewLabel}`
    }
    aria-current={item.isActive ? "page" : undefined}
  >
    <img
      src={item.viewConfig.baseImage}
      alt={`Thumbnail ${item.viewLabel}`}
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
    {item.isParent ? (
      <div className="absolute left-2 top-2 z-10 inline-flex items-center justify-center rounded-full bg-ui-surface-overlay/90 p-1.5 text-ui-foreground shadow-md backdrop-blur-sm">
        <MdSubdirectoryArrowLeft
          data-testid={`dock-parent-icon-${item.viewId}`}
          className="h-5 w-5 md:h-6 md:w-6"
        />
      </div>
    ) : null}
    <div
      className={`absolute inset-0 transition ${
        item.isActive
          ? "bg-ui-surface-image"
          : "bg-ui-surface-image-strong group-hover:bg-ui-surface-image"
      }`}
    />
    <div className="absolute inset-x-0 bottom-0 bg-ui-surface-image-strong px-3 py-1.5 text-sm font-semibold text-ui-foreground md:text-base">
      {item.viewLabel}
    </div>
    <div
      className={`absolute inset-x-0 bottom-0 h-1 transition ${
        item.isActive ? "bg-ui-foreground" : "bg-transparent group-hover:bg-ui-border-strong"
      }`}
    />
  </button>
);

export default LocationDockButton;
