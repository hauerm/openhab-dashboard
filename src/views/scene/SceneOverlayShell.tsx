import { useEffect, type PropsWithChildren } from "react";
import { MdClose } from "react-icons/md";

interface SceneOverlayShellProps extends PropsWithChildren {
  onClose: () => void;
  layout?: "dialog" | "fullscreen";
}

const SceneOverlayShell = ({
  onClose,
  children,
  layout = "dialog",
}: SceneOverlayShellProps) => {
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
      ? "fixed inset-0 z-50 bg-black/32 p-2 backdrop-blur-sm md:p-3"
      : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm";

  const panelClassName =
    layout === "fullscreen"
      ? "relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-3xl"
      : "relative w-full max-w-4xl rounded-2xl border border-white/20 bg-slate-950/85 p-4 shadow-2xl";

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
          className="absolute right-3 top-3 z-20 rounded-full border border-white/25 bg-slate-900/60 p-1.5 text-white/90 transition hover:bg-slate-800/80 hover:text-white"
          aria-label="Overlay schließen"
        >
          <MdClose className="h-5 w-5" />
        </button>
        {layout === "fullscreen" ? (
          <div className="relative z-10 h-full min-h-0">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default SceneOverlayShell;
