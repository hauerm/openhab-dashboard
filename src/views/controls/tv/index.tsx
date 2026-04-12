import { useState } from "react";
import { MdPowerSettingsNew } from "react-icons/md";
import { toast } from "react-toastify";
import netflixLogoUrl from "../../../assets/netflix.svg";
import primeVideoLogoUrl from "../../../assets/prime-video.svg";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { TvControlDefinition } from "../controlDefinitions";
import { sendViewItemCommand } from "../viewItemCommand";
import { useTvControlModel } from "./model";

const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

interface TvHudControlProps {
  definition: TvControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface TvOverlayControlProps {
  definition: TvControlDefinition;
  onClose: () => void;
}

const TV_APP_LOGO_BY_KEY = {
  netflix: netflixLogoUrl,
  "prime-video": primeVideoLogoUrl,
} as const;

const renderTvInfo = ({
  itemName,
  label,
  isOn,
  sourceApp,
  smallLine,
  largeLine,
  appLogoKey,
}: {
  itemName: string;
  label: string;
  isOn: boolean;
  sourceApp: string | null;
  smallLine: string | null;
  largeLine: string | null;
  appLogoKey: "netflix" | "prime-video" | null;
}) => {
  if (!isOn) {
    return null;
  }

  if (appLogoKey) {
    return (
      <span className="flex min-w-0 items-center">
        <img
          src={TV_APP_LOGO_BY_KEY[appLogoKey]}
          alt={sourceApp ?? label}
          className="block h-8 w-auto max-w-[9rem] object-contain md:h-10 md:max-w-[11rem]"
          data-testid={`living-control-tv-logo-${itemName}-${appLogoKey}`}
        />
      </span>
    );
  }

  return (
    <span className="min-w-0 max-w-[12rem] rounded-2xl border border-ui-border-subtle bg-ui-surface-image-strong px-4 py-3 text-left shadow-xl backdrop-blur-md md:max-w-[15rem]">
      {smallLine ? (
        <span
          className="block truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-ui-foreground-muted md:text-xs"
          data-testid={`living-control-tv-small-${itemName}`}
        >
          {smallLine}
        </span>
      ) : null}
      {largeLine ? (
        <span
          className="block truncate text-sm font-bold text-ui-foreground md:text-lg"
          data-testid={`living-control-tv-large-${itemName}`}
        >
          {largeLine}
        </span>
      ) : null}
    </span>
  );
};

export const TvHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  onOpenControl,
}: TvHudControlProps) => {
  const { isOn, sourceApp, smallLine, largeLine, appLogoKey } =
    useTvControlModel(definition);
  const itemName = definition.itemRefs.powerItemName;

  return (
    <button
      type="button"
      data-testid={`living-control-placeholder-${itemName}`}
      onClick={() => {
        if (!interactive) {
          return;
        }
        onOpenControl(definition.controlId);
      }}
      disabled={disabled}
      className="flex items-center gap-3 md:gap-4"
      aria-label={`${definition.label} (TV steuern)`}
    >
      <span
        className={`pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24 ${
          isOn
            ? "bg-status-good-surface shadow-[0_0_84px_20px_var(--color-semantic-active-glow)] hover:brightness-110"
            : "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel"
        }`}
      >
        <MdPowerSettingsNew
          data-testid={`living-control-placeholder-icon-${itemName}-${isOn ? "tv-on" : "tv-off"}`}
          className={`h-10 w-10 md:h-12 md:w-12 ${
            isOn
              ? "text-semantic-active-solid drop-shadow-[0_0_14px_var(--color-semantic-active-glow)]"
              : "text-ui-foreground"
          }`}
        />
      </span>
      {renderTvInfo({
        itemName,
        label: definition.label,
        isOn,
        sourceApp,
        smallLine,
        largeLine,
        appLogoKey,
      })}
    </button>
  );
};

export const TvOverlayControl = ({
  definition,
  onClose,
}: TvOverlayControlProps) => {
  const [sending, setSending] = useState(false);
  const { isOn, sourceApp, smallLine, largeLine, appLogoKey } =
    useTvControlModel(definition);
  const itemName = definition.itemRefs.powerItemName;
  const stateLabel = isOn ? sourceApp ?? smallLine ?? "Ein" : "Aus";

  const toggleTvPower = async () => {
    if (sending) {
      return;
    }

    const command = isOn ? "OFF" : "ON";
    try {
      setSending(true);
      await sendViewItemCommand(itemName, command, "OnOff");
    } catch (error) {
      void error;
      toast.error("TV-Befehl konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  };

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`living-tv-overlay-${itemName}`}
        className="pointer-events-none relative h-full w-full overflow-hidden"
      >
        <div className="pointer-events-none grid h-full min-h-0 w-full grid-cols-4 gap-2 p-2 md:gap-3 md:p-3">
          <section className="pointer-events-none flex flex-col items-start justify-start">
            <p className="text-xs font-semibold tracking-wide text-ui-foreground-muted md:text-sm">
              {definition.label}
            </p>
            {isOn && appLogoKey ? (
              <img
                src={TV_APP_LOGO_BY_KEY[appLogoKey]}
                alt={sourceApp ?? definition.label}
                className="mt-1 block h-10 w-auto max-w-[12rem] self-start object-contain md:h-14 md:max-w-[16rem]"
                data-testid={`living-tv-overlay-logo-${itemName}-${appLogoKey}`}
              />
            ) : (
              <p
                data-testid={`living-tv-overlay-state-${itemName}`}
                className={`text-4xl font-bold text-ui-foreground md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
              >
                {stateLabel}
              </p>
            )}
            {largeLine ? (
              <div className="mt-4 text-ui-foreground">
                <p
                  className="text-base font-semibold text-ui-foreground md:text-xl"
                  data-testid={`living-tv-overlay-content-${itemName}`}
                >
                  {largeLine}
                </p>
              </div>
            ) : null}
          </section>

          <section className="pointer-events-none grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-2">
            <button
              type="button"
              data-testid={`living-tv-overlay-power-${itemName}`}
              onClick={() => {
                void toggleTvPower();
              }}
              disabled={sending}
              className="pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border border-ui-border-subtle bg-ui-surface-panel text-ui-foreground transition hover:bg-ui-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
              aria-label={isOn ? "TV ausschalten" : "TV einschalten"}
            >
              <MdPowerSettingsNew
                className={`h-[80%] w-[80%] max-h-[10rem] max-w-[10rem] md:max-h-[12rem] md:max-w-[12rem] ${
                  isOn ? "text-semantic-active-solid" : "text-ui-foreground"
                }`}
              />
            </button>
          </section>

          <section className="pointer-events-none" aria-hidden="true" />
          <section className="pointer-events-none" aria-hidden="true" />
        </div>
      </div>
    </ViewOverlayShell>
  );
};
