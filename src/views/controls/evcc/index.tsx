import { useState } from "react";
import { MdBolt, MdDirectionsCar } from "react-icons/md";
import { toast } from "react-toastify";
import kiaLogoUrl from "../../../assets/kia.svg";
import skodaLogoUrl from "../../../assets/skoda.svg";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { EvccControlDefinition } from "../controlDefinitions";
import { sendViewItemCommand } from "../viewItemCommand";
import { useEvccControlModel } from "./model";
import type { EvccVehicleLogoKey } from "./model";

const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

interface EvccHudControlProps {
  definition: EvccControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface EvccOverlayControlProps {
  definition: EvccControlDefinition;
  onClose: () => void;
}

const MODE_OPTIONS = [
  { label: "PV", command: "pv" },
  { label: "Schnell", command: "now" },
  { label: "Aus", command: "off" },
  { label: "Min+PV", command: "minpv" },
] as const;

const LIMIT_OPTIONS = [100, 80, 50] as const;

const VEHICLE_LOGO_BY_KEY: Record<EvccVehicleLogoKey, string> = {
  kia: kiaLogoUrl,
  skoda: skodaLogoUrl,
};

const VEHICLE_LOGO_LABEL_BY_KEY: Record<EvccVehicleLogoKey, string> = {
  kia: "KIA",
  skoda: "SKODA",
};

const getHudSurfaceClassName = (
  hudState: "disconnected" | "connected-idle" | "charging"
): string => {
  if (hudState === "charging") {
    return "bg-status-good-surface hover:brightness-110";
  }
  if (hudState === "connected-idle") {
    return "bg-status-moderate-surface hover:brightness-110";
  }
  return "bg-ui-surface-overlay shadow-xl hover:bg-ui-surface-panel";
};

const getHudIconClassName = (
  hudState: "disconnected" | "connected-idle" | "charging"
): string => {
  if (hudState === "charging") {
    return "text-semantic-active-solid";
  }
  if (hudState === "connected-idle") {
    return "text-ui-warning-solid";
  }
  return "text-ui-foreground";
};

const SocProgressRings = ({
  soc,
  phases,
}: {
  soc: number | null;
  phases: number | null;
}) => {
  if (soc === null) {
    return null;
  }

  const progress = Math.max(0, Math.min(100, soc));
  const ringCount = phases === 3 ? 3 : 1;
  const rings =
    ringCount === 3
      ? [
          { radius: 45, strokeWidth: 2.6 },
          { radius: 40, strokeWidth: 2.6 },
          { radius: 35, strokeWidth: 2.6 },
        ]
      : [{ radius: 44, strokeWidth: 4.8 }];

  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
      aria-hidden="true"
    >
      {rings.map(({ radius, strokeWidth }) => {
        const circumference = 2 * Math.PI * radius;
        return (
          <g key={radius}>
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="var(--color-semantic-active-solid)"
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
            />
          </g>
        );
      })}
    </svg>
  );
};

const ChargingIcon = ({ className }: { className: string }) => (
  <span className={`relative flex h-12 w-12 items-center justify-center ${className}`}>
    <MdDirectionsCar className="h-11 w-11" />
    <MdBolt className="absolute -bottom-0.5 -right-3 h-6 w-6" />
  </span>
);

const VehicleLogo = ({
  logoKey,
  vehicleDisplayName,
}: {
  logoKey: EvccVehicleLogoKey | null;
  vehicleDisplayName: string | null;
}) => {
  const label = logoKey ? VEHICLE_LOGO_LABEL_BY_KEY[logoKey] : vehicleDisplayName;
  if (!label) {
    return null;
  }

  if (logoKey) {
    return (
      <span className="inline-flex min-h-8 min-w-16 items-center justify-center rounded-md bg-white px-2 py-1 shadow-xl md:min-h-10 md:min-w-20">
        <img
          src={VEHICLE_LOGO_BY_KEY[logoKey]}
          alt={label}
          className="block h-5 w-auto max-w-[4.5rem] object-contain md:h-6 md:max-w-[5.5rem]"
          data-testid={`living-control-evcc-logo-${logoKey}`}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex min-h-8 min-w-16 items-center justify-center rounded-md border border-ui-border-subtle bg-ui-surface-image-strong px-2 py-1 text-sm font-black text-ui-foreground shadow-xl backdrop-blur-md md:min-h-10 md:min-w-20 md:text-base">
      {label}
    </span>
  );
};

const renderEvccInfo = ({
  connected,
  itemName,
  vehicleDisplayName,
  vehicleLogoKey,
  vehicleSocDisplay,
  vehicleRangeDisplay,
}: {
  connected: boolean;
  itemName: string;
  vehicleDisplayName: string | null;
  vehicleLogoKey: EvccVehicleLogoKey | null;
  vehicleSocDisplay: string | null;
  vehicleRangeDisplay: string | null;
}) => {
  if (!connected) {
    return null;
  }

  return (
    <span className="flex min-w-0 items-start justify-center gap-2 md:gap-3">
      <span className="flex min-w-0 flex-col items-start">
        <VehicleLogo
          logoKey={vehicleLogoKey}
          vehicleDisplayName={vehicleDisplayName}
        />
        {vehicleRangeDisplay ? (
          <span
            data-testid={`living-control-evcc-range-${itemName}`}
            className={`mt-1 text-left text-xs font-semibold text-ui-foreground-muted md:text-sm ${TITLE_TEXT_SHADOW_CLASS}`}
          >
            {vehicleRangeDisplay}
          </span>
        ) : null}
      </span>
      <span className="flex min-h-8 items-center md:min-h-10">
        {vehicleSocDisplay ? (
          <span
            data-testid={`living-control-evcc-soc-${itemName}`}
            className={`text-2xl font-bold text-ui-foreground md:text-3xl ${TITLE_TEXT_SHADOW_CLASS}`}
          >
            {vehicleSocDisplay}
          </span>
        ) : null}
      </span>
    </span>
  );
};

const OverlayVehicleIdentity = ({
  itemName,
  vehicleDisplayName,
  vehicleLogoKey,
  vehicleRangeDisplay,
}: {
  itemName: string;
  vehicleDisplayName: string | null;
  vehicleLogoKey: EvccVehicleLogoKey | null;
  vehicleRangeDisplay: string | null;
}) => {
  const logoLabel = vehicleLogoKey
    ? VEHICLE_LOGO_LABEL_BY_KEY[vehicleLogoKey]
    : null;

  if (!logoLabel && !vehicleDisplayName && !vehicleRangeDisplay) {
    return null;
  }

  return (
    <div className="mt-8 flex max-w-full flex-col items-start text-ui-foreground">
      {vehicleLogoKey && logoLabel ? (
        <span className="inline-flex min-h-12 min-w-28 max-w-full items-center justify-center rounded-lg bg-white px-4 py-2 shadow-xl md:min-h-16 md:min-w-36">
          <img
            src={VEHICLE_LOGO_BY_KEY[vehicleLogoKey]}
            alt={logoLabel}
            className="block h-7 w-auto max-w-24 object-contain md:h-9 md:max-w-32"
            data-testid={`living-evcc-overlay-logo-${itemName}-${vehicleLogoKey}`}
          />
        </span>
      ) : vehicleDisplayName ? (
        <p
          data-testid={`living-evcc-overlay-vehicle-${itemName}`}
          className={`break-words text-4xl font-bold md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
        >
          {vehicleDisplayName}
        </p>
      ) : null}
      {vehicleRangeDisplay ? (
        <p
          data-testid={`living-evcc-overlay-range-${itemName}`}
          className={`mt-3 text-2xl font-bold text-ui-foreground-muted md:text-3xl ${TITLE_TEXT_SHADOW_CLASS}`}
        >
          {vehicleRangeDisplay}
        </p>
      ) : null}
    </div>
  );
};

const resolveOverlayPrimaryStatus = ({
  connected,
  vehicleSocDisplay,
}: {
  connected: boolean;
  vehicleSocDisplay: string | null;
}): string => {
  if (!connected) {
    return "Nicht verbunden";
  }

  return vehicleSocDisplay ?? "Verbunden";
};

export const EvccHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  onOpenControl,
}: EvccHudControlProps) => {
  const model = useEvccControlModel(definition);
  const itemName = definition.itemRefs.connectedItemName;

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
      aria-label={`${definition.label} (EVCC steuern)`}
    >
      <span
        className={`pointer-events-auto relative flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24 ${getHudSurfaceClassName(
          model.hudState
        )}`}
      >
        {model.connected ? (
          <SocProgressRings
            soc={model.vehicleSoc}
            phases={model.activePhases}
          />
        ) : null}
        {model.charging && model.chargePowerHudDisplay ? (
          <span
            data-testid={`living-control-placeholder-icon-${itemName}-evcc-power`}
            className={`relative z-10 text-2xl font-black md:text-3xl ${getHudIconClassName(
              model.hudState
            )}`}
          >
            {model.chargePowerHudDisplay}
          </span>
        ) : (
          <ChargingIcon
            className={`relative z-10 ${getHudIconClassName(model.hudState)}`}
          />
        )}
      </span>
      {renderEvccInfo({
        connected: model.connected,
        itemName,
        vehicleDisplayName: model.vehicleDisplayName,
        vehicleLogoKey: model.vehicleLogoKey,
        vehicleSocDisplay: model.vehicleSocDisplay,
        vehicleRangeDisplay: model.vehicleRangeDisplay,
      })}
    </button>
  );
};

export const EvccOverlayControl = ({
  definition,
  onClose,
}: EvccOverlayControlProps) => {
  const [sendingCommand, setSendingCommand] = useState<string | null>(null);
  const model = useEvccControlModel(definition);
  const itemName = definition.itemRefs.connectedItemName;
  const primaryStatus = resolveOverlayPrimaryStatus({
    connected: model.connected,
    vehicleSocDisplay: model.vehicleSocDisplay,
  });

  const sendModeCommand = async (command: string) => {
    if (sendingCommand) {
      return;
    }
    try {
      setSendingCommand(`mode-${command}`);
      await sendViewItemCommand(definition.itemRefs.modeItemName, command, "String", {
        optimisticRawState: command,
      });
    } catch (error) {
      void error;
      toast.error("EVCC-Modus konnte nicht gesetzt werden.");
    } finally {
      setSendingCommand(null);
    }
  };

  const sendLimitCommand = async (limit: number) => {
    if (sendingCommand) {
      return;
    }
    const command = String(limit);
    try {
      setSendingCommand(`limit-${command}`);
      await sendViewItemCommand(
        definition.itemRefs.limitSocItemName,
        command,
        "Decimal",
        { optimisticRawState: command }
      );
    } catch (error) {
      void error;
      toast.error("EVCC-Ladelimit konnte nicht gesetzt werden.");
    } finally {
      setSendingCommand(null);
    }
  };

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`living-evcc-overlay-${itemName}`}
        className="pointer-events-none relative h-full w-full overflow-hidden"
      >
        <div className="pointer-events-none grid h-full min-h-0 w-full grid-cols-4 gap-2 p-2 md:gap-3 md:p-3">
          <section className="pointer-events-none flex flex-col items-start justify-start overflow-hidden">
            <p className="text-xs font-semibold tracking-wide text-ui-foreground-muted md:text-sm">
              {definition.label}
            </p>
            <p className="flex max-w-full flex-wrap items-baseline gap-x-3">
              <span
                data-testid={`living-evcc-overlay-state-${itemName}`}
                className={`text-4xl font-bold text-ui-foreground md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
              >
                {primaryStatus}
              </span>
              {model.charging && model.chargePowerDisplay ? (
                <span
                  data-testid={`living-evcc-overlay-power-${itemName}`}
                  className={`text-xl font-bold text-ui-foreground-muted md:text-3xl ${TITLE_TEXT_SHADOW_CLASS}`}
                >
                  ({model.chargePowerDisplay})
                </span>
              ) : null}
            </p>
            <OverlayVehicleIdentity
              itemName={itemName}
              vehicleDisplayName={model.vehicleDisplayName}
              vehicleLogoKey={model.vehicleLogoKey}
              vehicleRangeDisplay={model.vehicleRangeDisplay}
            />
          </section>

          <section className="pointer-events-none grid h-full min-h-0 grid-rows-4 gap-2 md:gap-3">
            {MODE_OPTIONS.map((option) => {
              const active = model.mode?.toLowerCase() === option.command;
              return (
                <button
                  key={option.command}
                  type="button"
                  data-testid={`living-evcc-overlay-mode-${itemName}-${option.command}`}
                  onClick={() => {
                    void sendModeCommand(option.command);
                  }}
                  disabled={Boolean(sendingCommand)}
                  className={`pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold transition disabled:cursor-not-allowed disabled:opacity-70 md:text-4xl ${
                    active
                      ? "bg-status-moderate-surface text-status-moderate-foreground"
                      : "bg-ui-surface-panel text-ui-foreground hover:bg-ui-surface-muted"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </section>

          <section className="pointer-events-none grid h-full min-h-0 grid-rows-3 gap-2 md:gap-3">
            {LIMIT_OPTIONS.map((limit) => {
              const active = Math.round(model.limitSoc ?? -1) === limit;
              return (
                <button
                  key={limit}
                  type="button"
                  data-testid={`living-evcc-overlay-limit-${itemName}-${limit}`}
                  onClick={() => {
                    void sendLimitCommand(limit);
                  }}
                  disabled={Boolean(sendingCommand)}
                  className={`pointer-events-auto flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl text-3xl font-bold transition disabled:cursor-not-allowed disabled:opacity-70 md:text-5xl ${
                    active
                      ? "bg-status-good-surface text-status-good-foreground"
                      : "bg-ui-surface-panel text-ui-foreground hover:bg-ui-surface-muted"
                  }`}
                >
                  {limit}%
                </button>
              );
            })}
          </section>

          <section className="pointer-events-none" aria-hidden="true" />
        </div>
      </div>
    </ViewOverlayShell>
  );
};
