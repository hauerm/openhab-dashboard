import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  initializeWebSocket,
  disconnectWebSocket,
} from "./services/websocket-service";
import {
  getOpenHABRuntimeToken,
  setStoredOpenHABToken,
  validateOpenHABToken,
} from "./services/auth-token";
import ViewBackground from "./components/ViewBackground";
import BottomDock from "./components/BottomDock";
import { useViewStore } from "./stores/viewStore";
import type { ActiveViewOverlay } from "./types/overlay";
import ViewSidebar, { VIEW_SIDEBAR_SAFE_ZONE_PX } from "./views/ViewSidebar";
import ViewLayer from "./views/ViewLayer";

interface TokenLoginProps {
  onLogin: () => void;
}

function OpenHABTokenLogin({ onLogin }: TokenLoginProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedToken = token.trim();
    setError(null);
    setSubmitting(true);

    try {
      await validateOpenHABToken(trimmedToken);
      setStoredOpenHABToken(trimmedToken);
      setToken("");
      onLogin();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "openHAB API Token konnte nicht verifiziert werden."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ui-surface-shell text-ui-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),linear-gradient(135deg,rgba(9,17,28,0.94),rgba(22,33,48,0.98))]" />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-lg border border-ui-border-subtle bg-ui-surface-overlay p-5 shadow-2xl backdrop-blur"
        >
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-ui-foreground">
              openHAB verbinden
            </h1>
            <p className="mt-1 text-sm text-ui-foreground-muted">
              API Token eingeben, um das Dashboard auf diesem Geraet zu nutzen.
            </p>
          </div>
          <label
            htmlFor="openhab-token"
            className="mb-2 block text-sm font-medium text-ui-foreground"
          >
            API Token
          </label>
          <input
            id="openhab-token"
            data-testid="openhab-token-input"
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="h-11 w-full rounded-md border border-ui-border-subtle bg-ui-surface-muted px-3 text-sm text-ui-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {error ? (
            <div
              data-testid="openhab-token-error"
              className="mt-3 rounded-md border border-ui-warning-border bg-ui-warning-solid px-3 py-2 text-sm font-semibold text-ui-warning-foreground"
            >
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            data-testid="openhab-token-submit"
            disabled={submitting || token.trim().length === 0}
            className="mt-4 h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Pruefe Token..." : "Verbinden"}
          </button>
        </form>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

function App() {
  const [activeOverlay, setActiveOverlay] = useState<ActiveViewOverlay | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getOpenHABRuntimeToken() !== null
  );
  const initializeViewStore = useViewStore((state) => state.initialize);
  const currentView = useViewStore((state) => state.currentView);
  const loading = useViewStore((state) => state.loading);
  const error = useViewStore((state) => state.error);
  const currentViewConfig = useViewStore(
    (state) => state.viewConfigs[currentView]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    void initializeWebSocket();
    void initializeViewStore();
    return () => {
      disconnectWebSocket();
    };
  }, [initializeViewStore, isAuthenticated]);

  const visibleOverlay = useMemo(() => {
    if (!activeOverlay) {
      return null;
    }
    return activeOverlay.viewId === currentView ? activeOverlay : null;
  }, [activeOverlay, currentView]);

  const hasSidebar = Boolean(currentViewConfig?.location);
  const blockedLeftPx = hasSidebar ? VIEW_SIDEBAR_SAFE_ZONE_PX : 0;

  if (!isAuthenticated) {
    return <OpenHABTokenLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ui-surface-shell text-ui-foreground">
      <ViewBackground />
      {loading ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg border border-ui-border-subtle bg-ui-surface-overlay px-3 py-2 text-sm font-semibold text-ui-foreground shadow-xl backdrop-blur">
          Lade openHAB-Daten...
        </div>
      ) : null}
      {error ? (
        <div
          data-testid="view-store-error"
          className="fixed left-1/2 top-4 z-50 max-w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-ui-warning-border bg-ui-warning-solid px-3 py-2 text-sm font-semibold text-ui-warning-foreground shadow-xl"
        >
          {error}
        </div>
      ) : null}
      {hasSidebar ? (
        <ViewSidebar
          viewId={currentView}
          activeControlId={visibleOverlay?.controlId ?? null}
          onOpenControl={(controlId) => {
            setActiveOverlay({ viewId: currentView, controlId });
          }}
          onCloseControl={() => setActiveOverlay(null)}
        />
      ) : null}
      <ViewLayer
        activeControlId={visibleOverlay?.controlId ?? null}
        blockedLeftPx={blockedLeftPx}
        onOpenControl={(controlId) => {
          setActiveOverlay({ viewId: currentView, controlId });
        }}
        onCloseControl={() => setActiveOverlay(null)}
      />
      <BottomDock
        onViewChange={() => {
          setActiveOverlay(null);
        }}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

export default App;
