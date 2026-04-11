import { useState } from "react";
import { MdPowerSettingsNew } from "react-icons/md";
import { toast } from "react-toastify";
import netflixLogoUrl from "../../../../assets/netflix.svg";
import primeVideoLogoUrl from "../../../../assets/prime-video.svg";
import SceneOverlayShell from "../../SceneOverlayShell";
import type { TvControlDefinition } from "../controlDefinitions";
import { sendSceneItemCommand } from "../sceneItemCommand";
import { useTvControlModel } from "./model";

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
    <span className="min-w-0 max-w-[12rem] rounded-2xl border border-white/15 bg-black/45 px-4 py-3 text-left shadow-xl backdrop-blur-md md:max-w-[15rem]">
      {smallLine ? (
        <span
          className="block truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 md:text-xs"
          data-testid={`living-control-tv-small-${itemName}`}
        >
          {smallLine}
        </span>
      ) : null}
      {largeLine ? (
        <span
          className="block truncate text-sm font-bold text-white md:text-lg"
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
            ? "bg-[rgba(50,205,50,0.16)] shadow-[0_0_84px_20px_rgba(50,205,50,0.38)] hover:bg-[rgba(50,205,50,0.22)]"
            : "bg-black/30 shadow-xl hover:bg-black/45"
        }`}
      >
        <MdPowerSettingsNew
          data-testid={`living-control-placeholder-icon-${itemName}-${isOn ? "tv-on" : "tv-off"}`}
          className={`h-10 w-10 md:h-12 md:w-12 ${
            isOn
              ? "text-[#32CD32] drop-shadow-[0_0_14px_rgba(50,205,50,0.9)]"
              : "text-white"
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
      await sendSceneItemCommand(itemName, command, "OnOff");
    } catch (error) {
      void error;
      toast.error("TV-Befehl konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SceneOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`living-tv-overlay-${itemName}`}
        className="pointer-events-none relative h-full w-full overflow-hidden"
      >
        <div className="pointer-events-none grid h-full min-h-0 w-full grid-cols-4 gap-2 p-2 md:gap-3 md:p-3">
          <section className="pointer-events-none flex flex-col items-start justify-start">
            <p className="text-xs font-semibold tracking-wide text-white/80 md:text-sm">
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
                className="text-4xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] md:text-6xl"
              >
                {stateLabel}
              </p>
            )}
            {largeLine ? (
              <div className="mt-4 text-white">
                <p
                  className="text-base font-semibold text-white md:text-xl"
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
              className="pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-white/95 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label={isOn ? "TV ausschalten" : "TV einschalten"}
            >
              <MdPowerSettingsNew
                className={`h-[80%] w-[80%] max-h-[10rem] max-w-[10rem] md:max-h-[12rem] md:max-w-[12rem] ${
                  isOn ? "text-[#32CD32]" : "text-white"
                }`}
              />
            </button>
          </section>

          <section className="pointer-events-none" aria-hidden="true" />
          <section className="pointer-events-none" aria-hidden="true" />
        </div>
      </div>
    </SceneOverlayShell>
  );
};
