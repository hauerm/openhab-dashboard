import { useEffect, useMemo, useRef } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdStop,
} from "react-icons/md";
import { toast } from "react-toastify";
import { sendSceneItemCommand } from "./sceneItemCommand";
import {
  createRaffstoreSequenceController,
  type RaffstoreMotionCommand,
  type RaffstoreSequenceController,
  type RaffstoreTiltPreset,
} from "./raffstoreRetroLuxSequences";

interface RaffstoreControlProps {
  controlId: string;
  label: string;
  itemName: string;
  openingRawState?: string;
  disabled?: boolean;
  variant?: "card" | "overlay-fullscreen";
}

const parseOpeningPercent = (rawState: string | undefined): number | null => {
  if (!rawState) {
    return null;
  }

  const normalized = rawState.trim().toUpperCase();
  if (normalized === "UNDEF" || normalized === "NULL" || normalized === "-") {
    return null;
  }

  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[0].replace(",", "."));
  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(parsed)));
};

const sendRaffstoreCommand = async (
  itemName: string,
  command: RaffstoreMotionCommand
): Promise<void> => {
  if (command === "STOP") {
    await sendSceneItemCommand(itemName, command, "StopMove");
    return;
  }
  await sendSceneItemCommand(itemName, command, "UpDown");
};

const PRESET_BUTTON_CLASS =
  "flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-white/95 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-55";
const MANUAL_BUTTON_CLASS = PRESET_BUTTON_CLASS;
const PRESET_STACK_BUTTON_CLASS = PRESET_BUTTON_CLASS;

const MANUAL_BUTTON_ICON_CLASS =
  "h-[80%] w-[80%] max-h-[12rem] max-w-[12rem] md:max-h-[14rem] md:max-w-[14rem]";
const STOP_BUTTON_ICON_CLASS =
  "h-[80%] w-[80%] max-h-[9rem] max-w-[9rem] md:max-h-[11rem] md:max-w-[11rem]";

const PRESET_ICON_WRAPPER_CLASS =
  "relative flex h-[80%] w-[80%] items-center justify-center";
const TILT_ICON_CLASS = "h-full w-full text-white";

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

const RaffstoreControl = ({
  controlId,
  label,
  itemName,
  openingRawState,
  disabled = false,
  variant = "card",
}: RaffstoreControlProps) => {
  const openingPercent = useMemo(
    () => parseOpeningPercent(openingRawState),
    [openingRawState]
  );
  const openingDisplayValue = useMemo(() => {
    if (openingPercent === null) {
      return "--";
    }
    if (openingPercent === 0) {
      return "Oben";
    }
    if (openingPercent === 100) {
      return "Unten";
    }
    return `${openingPercent}%`;
  }, [openingPercent]);

  const itemNameRef = useRef(itemName);
  const openingPercentRef = useRef<number | null>(openingPercent);
  const sequenceControllerRef = useRef<RaffstoreSequenceController | null>(null);

  useEffect(() => {
    itemNameRef.current = itemName;
  }, [itemName]);

  useEffect(() => {
    openingPercentRef.current = openingPercent;
  }, [openingPercent]);

  useEffect(() => {
    sequenceControllerRef.current = createRaffstoreSequenceController({
      sendCommand: async (command) =>
        sendRaffstoreCommand(itemNameRef.current, command),
      getOpeningPercent: () => openingPercentRef.current,
    });

    return () => {
      void sequenceControllerRef.current?.cancel();
      sequenceControllerRef.current = null;
    };
  }, []);

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
    if (disabled) {
      return;
    }

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
      `Raffstore-Befehl für ${label} konnte nicht gesendet werden.`
    );
  };

  const runTiltPreset = async (preset: RaffstoreTiltPreset): Promise<void> => {
    await executeAction(
      async () => withController((controller) => controller.runTiltPreset(preset)),
      `Lamellen-Preset für ${label} konnte nicht ausgeführt werden.`
    );
  };

  const runArbeitsstellung = async (): Promise<void> => {
    await executeAction(
      async () => withController((controller) => controller.runArbeitsstellung()),
      `Arbeitsstellung für ${label} konnte nicht ausgeführt werden.`
    );
  };

  const runSchliessen = async (): Promise<void> => {
    await executeAction(
      async () => withController((controller) => controller.runSchliessen()),
      `Schließen für ${label} konnte nicht ausgeführt werden.`
    );
  };

  if (variant === "overlay-fullscreen") {
    return (
      <div
        data-testid={`raffstore-control-${controlId}`}
        className="relative h-full w-full overflow-hidden"
      >
        <div className="pointer-events-none grid h-full min-h-0 w-full grid-cols-4 gap-2 p-2 md:gap-3 md:p-3">
          <section className="pointer-events-none flex flex-col justify-start">
            <p className="text-xs font-semibold tracking-wide text-white/80 md:text-sm">
              {label}
            </p>
            <p
              data-testid={`raffstore-control-${controlId}-value`}
              className="text-4xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] md:text-6xl"
            >
              {openingDisplayValue}
            </p>
          </section>

          <section
            className="pointer-events-auto grid h-full min-h-0 grid-rows-[repeat(3,minmax(0,1fr))] gap-2 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-up`}
              onClick={() => {
                void runManualCommand("UP");
              }}
              disabled={disabled}
              className={MANUAL_BUTTON_CLASS}
              aria-label={`${label} Raffstore hochfahren`}
            >
              <MdKeyboardArrowUp className={MANUAL_BUTTON_ICON_CLASS} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-stop`}
              onClick={() => {
                void runManualCommand("STOP");
              }}
              disabled={disabled}
              className={MANUAL_BUTTON_CLASS}
              aria-label={`${label} Raffstore stoppen`}
            >
              <MdStop className={STOP_BUTTON_ICON_CLASS} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-down`}
              onClick={() => {
                void runManualCommand("DOWN");
              }}
              disabled={disabled}
              className={MANUAL_BUTTON_CLASS}
              aria-label={`${label} Raffstore runterfahren`}
            >
              <MdKeyboardArrowDown className={MANUAL_BUTTON_ICON_CLASS} />
            </button>
          </section>

          <section
            className="pointer-events-auto grid h-full min-h-0 grid-rows-[repeat(5,minmax(0,1fr))] gap-2 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-preset-arbeitsstellung`}
              onClick={() => {
                void runArbeitsstellung();
              }}
              disabled={disabled}
              className={PRESET_STACK_BUTTON_CLASS}
              aria-label={`${label} Arbeitsstellung`}
            >
              <TiltSectionIcon angleDeg={0} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-preset-tilt-25`}
              onClick={() => {
                void runTiltPreset(25);
              }}
              disabled={disabled}
              className={PRESET_STACK_BUTTON_CLASS}
              aria-label={`${label} Lamelle 25 Prozent`}
            >
              <TiltSectionIcon angleDeg={TILT_ANGLE_BY_PRESET[25]} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-preset-tilt-50`}
              onClick={() => {
                void runTiltPreset(50);
              }}
              disabled={disabled}
              className={PRESET_STACK_BUTTON_CLASS}
              aria-label={`${label} Lamelle 50 Prozent`}
            >
              <TiltSectionIcon angleDeg={TILT_ANGLE_BY_PRESET[50]} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-preset-tilt-75`}
              onClick={() => {
                void runTiltPreset(75);
              }}
              disabled={disabled}
              className={PRESET_STACK_BUTTON_CLASS}
              aria-label={`${label} Lamelle 75 Prozent`}
            >
              <TiltSectionIcon angleDeg={TILT_ANGLE_BY_PRESET[75]} />
            </button>
            <button
              type="button"
              data-testid={`raffstore-control-${controlId}-preset-schliessen`}
              onClick={() => {
                void runSchliessen();
              }}
              disabled={disabled}
              className={PRESET_STACK_BUTTON_CLASS}
              aria-label={`${label} Schließen`}
            >
              <TiltSectionIcon angleDeg={85} />
            </button>
          </section>

          <section className="pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={`raffstore-control-${controlId}`}
      className="pointer-events-auto rounded-2xl border border-white/30 bg-slate-900/60 p-3 text-white shadow-2xl backdrop-blur-md"
    >
      <p
        data-testid={`raffstore-control-${controlId}-value`}
        className="mb-2 text-center text-xs font-semibold tracking-wide text-white/75"
      >
        {openingDisplayValue}
      </p>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          data-testid={`raffstore-control-${controlId}-up`}
          onClick={() => {
            void runManualCommand("UP");
          }}
          disabled={disabled}
          className="rounded-xl p-1.5 text-white/95 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55"
          aria-label={`${label} Raffstore hochfahren`}
        >
          <MdKeyboardArrowUp className="h-9 w-9" />
        </button>
        <button
          type="button"
          data-testid={`raffstore-control-${controlId}-stop`}
          onClick={() => {
            void runManualCommand("STOP");
          }}
          disabled={disabled}
          className="rounded-xl p-1.5 text-white/95 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55"
          aria-label={`${label} Raffstore stoppen`}
        >
          <MdStop className="h-8 w-8" />
        </button>
        <button
          type="button"
          data-testid={`raffstore-control-${controlId}-down`}
          onClick={() => {
            void runManualCommand("DOWN");
          }}
          disabled={disabled}
          className="rounded-xl p-1.5 text-white/95 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55"
          aria-label={`${label} Raffstore runterfahren`}
        >
          <MdKeyboardArrowDown className="h-9 w-9" />
        </button>
      </div>
    </div>
  );
};

export default RaffstoreControl;
