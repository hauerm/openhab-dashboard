import { useState } from "react";
import {
  MdBatteryChargingFull,
  MdBatteryFull,
  MdBolt,
  MdDirectionsCar,
} from "react-icons/md";
import { toast } from "react-toastify";
import kiaLogoUrl from "../../../assets/kia.svg";
import skodaLogoUrl from "../../../assets/skoda.svg";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { EvccControlDefinition } from "../controlDefinitions";
import { sendViewItemCommand } from "../viewItemCommand";
import { useEvccControlModel } from "./model";
import type { EvccBatteryPowerState, EvccVehicleLogoKey } from "./model";

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

const getSocProgressStroke = (soc: number): string => {
  if (soc < 15) {
    return "var(--color-scale-soc-critical)";
  }
  if (soc < 50) {
    return "var(--color-scale-soc-low)";
  }
  return "var(--color-scale-soc-ok)";
};

const getSocTextClassName = (soc: number | null): string => {
  if (soc === null) {
    return "text-ui-foreground";
  }
  if (soc < 15) {
    return "text-scale-soc-critical";
  }
  if (soc < 50) {
    return "text-scale-soc-low";
  }
  return "text-scale-soc-ok";
};

const SocProgressRings = ({
  soc,
  phases,
  testIdPrefix = "living-control-evcc-soc-ring",
}: {
  soc: number | null;
  phases: number | null;
  testIdPrefix?: string;
}) => {
  if (soc === null) {
    return null;
  }

  const progress = Math.max(0, Math.min(100, soc));
  const ringCount = phases === 3 ? 3 : 1;
  const progressStroke = getSocProgressStroke(progress);
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
              stroke="var(--color-ui-ring-track)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={progressStroke}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              data-testid={`${testIdPrefix}-${radius}`}
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

const BatteryChargingIcon = ({
  itemName,
  batterySoc,
  batteryPowerState,
}: {
  itemName: string;
  batterySoc: number | null;
  batteryPowerState: EvccBatteryPowerState;
}) => {
  const Icon =
    batteryPowerState === "charging" ? MdBatteryChargingFull : MdBatteryFull;

  return (
    <span
      data-testid={`living-control-evcc-battery-${itemName}`}
      className="pointer-events-auto relative flex h-15 w-15 items-center justify-center rounded-full bg-status-good-surface backdrop-blur-sm transition hover:brightness-110 md:h-18 md:w-18"
      aria-hidden="true"
    >
      <SocProgressRings
        soc={batterySoc}
        phases={1}
        testIdPrefix="living-control-evcc-battery-soc-ring"
      />
      <Icon className="relative z-10 h-7 w-7 text-semantic-active-solid md:h-9 md:w-9" />
    </span>
  );
};

const BatteryHudInfo = ({
  itemName,
  batterySoc,
  batterySocDisplay,
  batteryPowerStateDisplay,
}: {
  itemName: string;
  batterySoc: number | null;
  batterySocDisplay: string | null;
  batteryPowerStateDisplay: string | null;
}) => {
  if (!batterySocDisplay) {
    return null;
  }

  return (
    <span
      data-testid={`living-control-evcc-battery-soc-${itemName}`}
      className={`rounded-md bg-black/85 px-2 py-1 text-lg font-bold leading-none shadow-xl md:text-2xl ${getSocTextClassName(
        batterySoc
      )} ${TITLE_TEXT_SHADOW_CLASS}`}
    >
      <span>{batterySocDisplay}</span>
      {batteryPowerStateDisplay ? (
        <span
          data-testid={`living-control-evcc-battery-state-${itemName}`}
          className="ml-2 text-sm font-semibold text-white/85 md:text-base"
        >
          {batteryPowerStateDisplay}
        </span>
      ) : null}
    </span>
  );
};

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
      <span className="inline-flex min-h-10 min-w-20 shrink-0 items-center justify-center rounded-tl-md bg-white/85 px-2.5 py-1.5 shadow-xl md:min-h-12 md:min-w-24">
        <img
          src={VEHICLE_LOGO_BY_KEY[logoKey]}
          alt={label}
          className="block h-6 w-auto max-w-[5.625rem] object-contain md:h-7 md:max-w-[6.875rem]"
          data-testid={`living-control-evcc-logo-${logoKey}`}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex min-h-10 min-w-20 shrink-0 items-center justify-center rounded-tl-md border border-ui-border-subtle bg-white/85 px-2.5 py-1.5 text-base font-black text-black shadow-xl backdrop-blur-md md:min-h-12 md:min-w-24 md:text-xl">
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
  effectivePlanSocDisplay,
  effectivePlanTimeDisplay,
}: {
  connected: boolean;
  itemName: string;
  vehicleDisplayName: string | null;
  vehicleLogoKey: EvccVehicleLogoKey | null;
  vehicleSocDisplay: string | null;
  vehicleRangeDisplay: string | null;
  effectivePlanSocDisplay: string | null;
  effectivePlanTimeDisplay: string | null;
}) => {
  if (!connected) {
    return null;
  }

  const planDetails =
    effectivePlanSocDisplay && effectivePlanTimeDisplay
      ? `${effectivePlanSocDisplay} bis ${effectivePlanTimeDisplay}`
      : "Keine Ladeplanung aktiv";

  return (
    <span className="inline-flex w-max min-w-0 flex-col items-stretch">
      <span className="flex min-w-0 items-stretch justify-center">
        <VehicleLogo
          logoKey={vehicleLogoKey}
          vehicleDisplayName={vehicleDisplayName}
        />
        <span
          data-testid={`living-control-evcc-values-${itemName}`}
          className="flex min-h-10 min-w-20 shrink-0 flex-col items-start justify-center rounded-tr-md bg-black/85 px-2.5 py-1.5 shadow-xl md:min-h-12 md:min-w-24"
        >
          {vehicleSocDisplay ? (
            <span
              data-testid={`living-control-evcc-soc-${itemName}`}
              className={`text-2xl font-bold leading-none text-white md:text-3xl ${TITLE_TEXT_SHADOW_CLASS}`}
            >
              {vehicleSocDisplay}
            </span>
          ) : null}
          {vehicleRangeDisplay ? (
            <span
              data-testid={`living-control-evcc-range-${itemName}`}
              className={`mt-0.5 text-sm font-semibold leading-none text-white/85 md:text-lg ${TITLE_TEXT_SHADOW_CLASS}`}
            >
              {vehicleRangeDisplay}
            </span>
          ) : null}
        </span>
      </span>
      <span
        data-testid={`living-control-evcc-plan-${itemName}`}
        className="w-full max-w-full whitespace-nowrap rounded-b-md bg-blue-600/85 px-2.5 py-1.5 text-left text-sm font-bold leading-tight text-white shadow-xl md:text-base"
      >
        {planDetails}
      </span>
    </span>
  );
};

const OverlayPlanStatus = ({
  itemName,
  effectivePlanId,
  effectivePlanSocDisplay,
  effectivePlanTimeDisplay,
}: {
  itemName: string;
  effectivePlanId: number | null;
  effectivePlanSocDisplay: string | null;
  effectivePlanTimeDisplay: string | null;
}) => {
  const hasPlan =
    effectivePlanId !== null && effectivePlanSocDisplay && effectivePlanTimeDisplay;
  const title = !hasPlan
    ? "Keine Ladeplanung aktiv"
    : effectivePlanId === 0
      ? "Einmalplan"
      : "Wiederholender Plan";
  const details = hasPlan
    ? `${effectivePlanSocDisplay} bis ${effectivePlanTimeDisplay}`
    : null;

  return (
    <div
      data-testid={`living-evcc-overlay-plan-status-${itemName}`}
      className={`mt-6 rounded-lg bg-blue-600/85 px-4 py-3 text-white shadow-xl ${TITLE_TEXT_SHADOW_CLASS}`}
    >
      <p className="text-lg font-bold leading-tight md:text-2xl">{title}</p>
      {details ? (
        <p
          data-testid={`living-evcc-overlay-plan-details-${itemName}`}
          className="mt-1 text-sm font-semibold leading-tight text-white/90 md:text-lg"
        >
          {details}
        </p>
      ) : null}
    </div>
  );
};

const RepeatingPlanToggle = ({
  itemName,
  active,
  disabled,
  onToggle,
}: {
  itemName: string;
  active: boolean | null;
  disabled: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    data-testid={`living-evcc-overlay-repeating-plan-${itemName}`}
    onClick={onToggle}
    disabled={disabled}
    className={`pointer-events-auto flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-2xl px-4 text-center text-2xl font-bold transition disabled:cursor-not-allowed disabled:opacity-70 md:text-4xl ${
      active
        ? "bg-blue-600/85 text-white hover:brightness-110"
        : "bg-ui-surface-panel text-ui-foreground hover:bg-ui-surface-muted"
    }`}
  >
    <span>Wiederholender Plan</span>
    <span className="mt-2 text-base font-semibold md:text-2xl">
      {active ? "Aktiv" : "Inaktiv"}
    </span>
  </button>
);

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
      className="pointer-events-auto flex items-center gap-3 md:gap-4"
      aria-label={`${definition.label} (EVCC steuern)`}
    >
      <span className="flex flex-col items-start gap-1 md:gap-1.5">
        <span className="grid grid-cols-[5rem_auto] items-center gap-3 md:grid-cols-[6rem_auto] md:gap-4">
          <span
            className={`pointer-events-auto relative flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm transition md:h-24 md:w-24 ${getHudSurfaceClassName(
              model.hudState
            )} justify-self-center`}
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
            effectivePlanSocDisplay: model.effectivePlanSocDisplay,
            effectivePlanTimeDisplay: model.effectivePlanTimeDisplay,
          })}
        </span>
        {model.batterySocDisplay || model.batteryPowerState ? (
          <span className="grid grid-cols-[5rem_auto] items-center gap-3 md:grid-cols-[6rem_auto] md:gap-4">
            <span className="justify-self-center">
              <BatteryChargingIcon
                itemName={itemName}
                batterySoc={model.batterySoc}
                batteryPowerState={model.batteryPowerState}
              />
            </span>
            <BatteryHudInfo
              itemName={itemName}
              batterySoc={model.batterySoc}
              batterySocDisplay={model.batterySocDisplay}
              batteryPowerStateDisplay={model.batteryPowerStateDisplay}
            />
          </span>
        ) : null}
      </span>
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

  const sendRepeatingPlanActiveCommand = async () => {
    const repeatingPlanActiveItemName =
      definition.itemRefs.repeatingPlanActiveItemName;
    if (!repeatingPlanActiveItemName || sendingCommand) {
      return;
    }

    const command = model.repeatingPlanActive ? "OFF" : "ON";
    try {
      setSendingCommand("repeating-plan-active");
      await sendViewItemCommand(repeatingPlanActiveItemName, command, "OnOff", {
        optimisticRawState: command,
      });
    } catch (error) {
      void error;
      toast.error("EVCC-Wiederholplan konnte nicht gesetzt werden.");
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
            <OverlayPlanStatus
              itemName={itemName}
              effectivePlanId={model.effectivePlanId}
              effectivePlanSocDisplay={model.effectivePlanSocDisplay}
              effectivePlanTimeDisplay={model.effectivePlanTimeDisplay}
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

          <section className="pointer-events-none flex h-full min-h-0">
            {definition.itemRefs.repeatingPlanActiveItemName ? (
              <RepeatingPlanToggle
                itemName={itemName}
                active={model.repeatingPlanActive}
                disabled={Boolean(sendingCommand)}
                onToggle={() => {
                  void sendRepeatingPlanActiveCommand();
                }}
              />
            ) : null}
          </section>
        </div>
      </div>
    </ViewOverlayShell>
  );
};
