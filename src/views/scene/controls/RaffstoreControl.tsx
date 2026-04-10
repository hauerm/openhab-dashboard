import { useMemo, useState } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdStop,
} from "react-icons/md";
import { toast } from "react-toastify";
import { sendSceneItemCommand } from "./sceneItemCommand";

interface RaffstoreControlProps {
  controlId: string;
  label: string;
  itemName: string;
  openingRawState?: string;
  disabled?: boolean;
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

const RaffstoreControl = ({
  controlId,
  label,
  itemName,
  openingRawState,
  disabled = false,
}: RaffstoreControlProps) => {
  const [pendingCommand, setPendingCommand] = useState<
    "UP" | "DOWN" | "STOP" | null
  >(null);
  const openingPercent = useMemo(
    () => parseOpeningPercent(openingRawState),
    [openingRawState]
  );

  const sendMoveCommand = async (command: "UP" | "DOWN" | "STOP") => {
    if (pendingCommand || disabled) {
      return;
    }

    try {
      setPendingCommand(command);
      if (command === "STOP") {
        await sendSceneItemCommand(itemName, command, "StopMove");
      } else {
        await sendSceneItemCommand(itemName, command, "UpDown");
      }
    } catch (error) {
      void error;
      toast.error(`Raffstore-Befehl für ${label} konnte nicht gesendet werden.`);
    } finally {
      setPendingCommand(null);
    }
  };

  return (
    <div
      data-testid={`raffstore-control-${controlId}`}
      className="pointer-events-auto rounded-2xl border border-white/30 bg-slate-900/60 p-3 text-white shadow-2xl backdrop-blur-md"
    >
      <p
        data-testid={`raffstore-control-${controlId}-value`}
        className="mb-2 text-center text-xs font-semibold tracking-wide text-white/75"
      >
        {openingPercent === null ? "--" : `${openingPercent}%`}
      </p>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          data-testid={`raffstore-control-${controlId}-up`}
          onClick={() => {
            void sendMoveCommand("UP");
          }}
          disabled={pendingCommand !== null || disabled}
          className="rounded-xl p-1.5 text-white/95 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55"
          aria-label={`${label} Raffstore hochfahren`}
        >
          <MdKeyboardArrowUp className="h-9 w-9" />
        </button>
        <button
          type="button"
          data-testid={`raffstore-control-${controlId}-stop`}
          onClick={() => {
            void sendMoveCommand("STOP");
          }}
          disabled={pendingCommand !== null || disabled}
          className="rounded-xl p-1.5 text-white/95 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55"
          aria-label={`${label} Raffstore stoppen`}
        >
          <MdStop className="h-8 w-8" />
        </button>
        <button
          type="button"
          data-testid={`raffstore-control-${controlId}-down`}
          onClick={() => {
            void sendMoveCommand("DOWN");
          }}
          disabled={pendingCommand !== null || disabled}
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
