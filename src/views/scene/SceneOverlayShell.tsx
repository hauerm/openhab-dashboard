import type { PropsWithChildren } from "react";

interface SceneOverlayShellProps extends PropsWithChildren {
  onClose: () => void;
}

const SceneOverlayShell = ({ onClose, children }: SceneOverlayShellProps) => (
  <div
    data-testid="overlay-backdrop"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-4xl rounded-2xl border border-white/20 bg-slate-950/85 p-4 shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

export default SceneOverlayShell;

