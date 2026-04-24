import { useEffect, useRef } from "react";
import {
  MdBlinds,
  MdBlindsClosed,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdStop,
  MdWindow,
} from "react-icons/md";
import { toast } from "react-toastify";
import ViewOverlayShell from "../../ViewOverlayShell";
import type { RaffstoreControlDefinition } from "../controlDefinitions";
import { sendViewItemCommand } from "../viewItemCommand";
import { useRaffstoreControlModel } from "./model";
import {
  createRaffstoreSequenceController,
  type RaffstoreMotionCommand,
  type RaffstoreSequenceController,
  type RaffstoreTiltPreset,
} from "./sequences";

interface RaffstoreHudControlProps {
  definition: RaffstoreControlDefinition;
  disabled?: boolean;
  interactive?: boolean;
  onOpenControl: (controlId: string) => void;
}

interface RaffstoreOverlayControlProps {
  definition: RaffstoreControlDefinition;
  onClose: () => void;
}

const HUD_ICON_BY_STATE = {
  "raffstore-open": MdWindow,
  "raffstore-half": MdBlinds,
  "raffstore-closed": MdBlindsClosed,
} as const;

const PRESET_BUTTON_CLASS =
  "flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border border-ui-border-subtle bg-ui-surface-panel text-ui-foreground transition hover:bg-ui-surface-muted disabled:cursor-not-allowed disabled:opacity-55";
const MANUAL_BUTTON_CLASS = PRESET_BUTTON_CLASS;
const PRESET_STACK_BUTTON_CLASS = PRESET_BUTTON_CLASS;

const MANUAL_BUTTON_ICON_CLASS =
  "h-[80%] w-[80%] max-h-[12rem] max-w-[12rem] md:max-h-[14rem] md:max-w-[14rem]";
const STOP_BUTTON_ICON_CLASS =
  "h-[80%] w-[80%] max-h-[9rem] max-w-[9rem] md:max-h-[11rem] md:max-w-[11rem]";

const PRESET_ICON_WRAPPER_CLASS =
  "relative flex h-[80%] w-[80%] items-center justify-center";
const TILT_ICON_CLASS = "h-full w-full text-ui-foreground";
const TITLE_TEXT_SHADOW_CLASS = "[text-shadow:0_2px_10px_var(--color-ui-shadow-text)]";

const TILT_ANGLE_BY_PRESET: Record<RaffstoreTiltPreset, number> = {
  25: 22.5,
  50: 45,
  75: 67.5,
};

const TiltSectionIcon = ({ angleDeg }: { angleDeg: number }) => {
  const mirroredAngleDeg = -angleDeg;

  return (
    <span className={PRESET_ICON_WRAPPER_CLASS}>
      <svg
        viewBox="0 0 100 100"
        className={TILT_ICON_CLASS}
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="50"
          y1="14"
          x2="50"
          y2="86"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <line
          x1="25"
          y1="50"
          x2="75"
          y2="50"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          transform={`rotate(${mirroredAngleDeg} 50 50)`}
        />
      </svg>
    </span>
  );
};

const sendRaffstoreCommand = async (
  itemNames: readonly string[],
  command: RaffstoreMotionCommand
): Promise<void> => {
  if (command === "STOP") {
    await Promise.all(
      itemNames.map((itemName) => sendViewItemCommand(itemName, command, "StopMove"))
    );
    return;
  }
  await Promise.all(
    itemNames.map((itemName) => sendViewItemCommand(itemName, command, "UpDown"))
  );
};

export const RaffstoreHudControl = ({
  definition,
  disabled = false,
  interactive = true,
  onOpenControl,
}: RaffstoreHudControlProps) => {
  const { hudState } = useRaffstoreControlModel(definition);
  const Icon = HUD_ICON_BY_STATE[hudState];
  const ariaKind =
    definition.subtype === "awning"
      ? "Markise"
      : definition.subtype === "rollershutter"
      ? "Rollladen"
      : "Raffstore";

  return (
    <button
      type="button"
      data-testid={`living-control-placeholder-${definition.itemRefs.itemName}`}
      disabled={disabled}
      onClick={() => {
        if (!interactive) {
          return;
        }
        onOpenControl(definition.controlId);
      }}
      className="flex items-center justify-center"
      aria-label={`${definition.label} (${ariaKind} öffnen)`}
    >
      <span className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full bg-ui-surface-overlay backdrop-blur-sm shadow-xl transition hover:bg-ui-surface-panel md:h-24 md:w-24">
        <Icon
          data-testid={`living-control-placeholder-icon-${definition.itemRefs.itemName}-${hudState}`}
          className="h-10 w-10 text-ui-foreground md:h-12 md:w-12"
        />
      </span>
    </button>
  );
};

export const RaffstoreOverlayControl = ({
  definition,
  onClose,
}: RaffstoreOverlayControlProps) => {
  const { openingPercent, openingDisplayValue } = useRaffstoreControlModel(definition);
  const sequenceControllerRef = useRef<RaffstoreSequenceController | null>(null);
  const openingPercentRef = useRef<number | null>(openingPercent);

  useEffect(() => {
    openingPercentRef.current = openingPercent;
  }, [openingPercent]);

  useEffect(() => {
    sequenceControllerRef.current = createRaffstoreSequenceController({
      sendCommand: async (command) =>
        sendRaffstoreCommand(definition.itemRefs.itemNames, command),
      getOpeningPercent: () => openingPercentRef.current,
    });

    return () => {
      void sequenceControllerRef.current?.cancel();
      sequenceControllerRef.current = null;
    };
  }, [definition.itemRefs.itemNames]);

  const withController = async (
    executor: (controller: RaffstoreSequenceController) => Promise<void>
  ): Promise<void> => {
    const controller = sequenceControllerRef.current;
    if (!controller) {
      return;
    }
    await executor(controller);
  };

  const executeAction = async (
    action: () => Promise<void>,
    errorMessage: string
  ): Promise<void> => {
    try {
      await action();
    } catch (error) {
      void error;
      toast.error(errorMessage);
    }
  };

  const runManualCommand = async (command: RaffstoreMotionCommand): Promise<void> => {
    await executeAction(
      async () => withController((controller) => controller.runManualCommand(command)),
      `Raffstore-Befehl für ${definition.label} konnte nicht gesendet werden.`
    );
  };

  const runTiltPreset = async (preset: RaffstoreTiltPreset): Promise<void> => {
    await executeAction(
      async () => withController((controller) => controller.runTiltPreset(preset)),
      `Lamellen-Preset für ${definition.label} konnte nicht ausgeführt werden.`
    );
  };

  const runArbeitsstellung = async (): Promise<void> => {
    await executeAction(
      async () => withController((controller) => controller.runArbeitsstellung()),
      `Arbeitsstellung für ${definition.label} konnte nicht ausgeführt werden.`
    );
  };

  const runSchliessen = async (): Promise<void> => {
    await executeAction(
      async () => withController((controller) => controller.runSchliessen()),
      `Schließen für ${definition.label} konnte nicht ausgeführt werden.`
    );
  };

  return (
    <ViewOverlayShell onClose={onClose} layout="fullscreen">
      <div
        data-testid={`raffstore-control-${definition.controlId}`}
        className="pointer-events-none relative h-full w-full overflow-hidden"
      >
        <div className="pointer-events-none grid h-full min-h-0 w-full grid-cols-4 gap-2 p-2 md:gap-3 md:p-3">
          <section className="pointer-events-none flex flex-col justify-start">
            <p className="text-xs font-semibold tracking-wide text-ui-foreground-muted md:text-sm">
              {definition.label}
            </p>
            <p
              data-testid={`raffstore-control-${definition.controlId}-value`}
              className={`text-4xl font-bold text-ui-foreground md:text-6xl ${TITLE_TEXT_SHADOW_CLASS}`}
            >
              {openingDisplayValue}
            </p>
          </section>

          <section className="pointer-events-none grid h-full min-h-0 grid-rows-[repeat(3,minmax(0,1fr))] gap-2 overflow-hidden">
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-up`}
              onClick={() => {
                void runManualCommand("UP");
              }}
              className={`pointer-events-auto ${MANUAL_BUTTON_CLASS}`}
              aria-label={`${definition.label} Raffstore hochfahren`}
            >
              <MdKeyboardArrowUp className={MANUAL_BUTTON_ICON_CLASS} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-stop`}
              onClick={() => {
                void runManualCommand("STOP");
              }}
              className={`pointer-events-auto ${MANUAL_BUTTON_CLASS}`}
              aria-label={`${definition.label} Raffstore stoppen`}
            >
              <MdStop className={STOP_BUTTON_ICON_CLASS} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-down`}
              onClick={() => {
                void runManualCommand("DOWN");
              }}
              className={`pointer-events-auto ${MANUAL_BUTTON_CLASS}`}
              aria-label={`${definition.label} Raffstore runterfahren`}
            >
              <MdKeyboardArrowDown className={MANUAL_BUTTON_ICON_CLASS} />
            </button>
          </section>

          <section className="pointer-events-none grid h-full min-h-0 grid-rows-[repeat(5,minmax(0,1fr))] gap-2 overflow-hidden">
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-preset-arbeitsstellung`}
              onClick={() => {
                void runArbeitsstellung();
              }}
              className={`pointer-events-auto ${PRESET_STACK_BUTTON_CLASS}`}
              aria-label={`${definition.label} Arbeitsstellung`}
            >
              <TiltSectionIcon angleDeg={0} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-preset-tilt-25`}
              onClick={() => {
                void runTiltPreset(25);
              }}
              className={`pointer-events-auto ${PRESET_STACK_BUTTON_CLASS}`}
              aria-label={`${definition.label} Lamelle 25 Prozent`}
            >
              <TiltSectionIcon angleDeg={TILT_ANGLE_BY_PRESET[25]} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-preset-tilt-50`}
              onClick={() => {
                void runTiltPreset(50);
              }}
              className={`pointer-events-auto ${PRESET_STACK_BUTTON_CLASS}`}
              aria-label={`${definition.label} Lamelle 50 Prozent`}
            >
              <TiltSectionIcon angleDeg={TILT_ANGLE_BY_PRESET[50]} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-preset-tilt-75`}
              onClick={() => {
                void runTiltPreset(75);
              }}
              className={`pointer-events-auto ${PRESET_STACK_BUTTON_CLASS}`}
              aria-label={`${definition.label} Lamelle 75 Prozent`}
            >
              <TiltSectionIcon angleDeg={TILT_ANGLE_BY_PRESET[75]} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${definition.controlId}-preset-schliessen`}
              onClick={() => {
                void runSchliessen();
              }}
              className={`pointer-events-auto ${PRESET_STACK_BUTTON_CLASS}`}
              aria-label={`${definition.label} Schließen`}
            >
              <TiltSectionIcon angleDeg={85} />
            </button>
          </section>

          <section className="pointer-events-none" />
        </div>
      </div>
    </ViewOverlayShell>
  );
};
