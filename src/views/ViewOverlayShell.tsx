import { useEffect, type PropsWithChildren } from "react";
import { MdClose } from "react-icons/md";

interface ViewOverlayShellProps extends PropsWithChildren {
  onClose: () => void;
  layout?: "dialog" | "fullscreen";
}

const ViewOverlayShell = ({
  onClose,
  children,
  layout = "dialog",
}: ViewOverlayShellProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const backdropClassName =
    layout === "fullscreen"
      ? "fixed inset-0 z-50 bg-ui-backdrop-soft p-2 backdrop-blur-sm md:p-3"
      : "fixed inset-0 z-50 flex items-center justify-center bg-ui-backdrop-strong p-4 backdrop-blur-sm";

  const panelClassName =
    layout === "fullscreen"
      ? "relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-3xl"
      : "relative w-full max-w-4xl rounded-2xl border border-ui-border-subtle bg-ui-surface-panel p-4 text-ui-foreground shadow-2xl";

  return (
    <div
      data-testid="overlay-backdrop"
      className={backdropClassName}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={panelClassName} onClick={(event) => event.stopPropagation()}>
        {layout === "fullscreen" ? (
          <button
            type="button"
            data-testid="overlay-close-area"
            className="absolute inset-0 z-0"
            onClick={onClose}
            aria-label="Overlay schließen"
          />
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto absolute right-3 top-3 z-20 rounded-full border border-ui-border-subtle bg-ui-surface-overlay p-1.5 text-ui-foreground transition hover:bg-ui-surface-panel"
          aria-label="Overlay schließen"
        >
          <MdClose className="h-5 w-5" />
        </button>
        {layout === "fullscreen" ? (
          <div className="pointer-events-none relative z-10 h-full min-h-0">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ViewOverlayShell;
