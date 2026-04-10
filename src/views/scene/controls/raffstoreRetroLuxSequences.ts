export type RaffstoreMotionCommand = "UP" | "DOWN" | "STOP";
export type RaffstoreTiltPreset = 25 | 50 | 75;

export interface RaffstoreRetroLuxTimings {
  arbeitsstellungUpMs: number;
  arbeitsstellungDownMs: number;
  commandPauseMs: number;
  schliessenUpMsDefault: number;
  schliessenUpMsEndlage: number;
  schliessenDownMsDefault: number;
  schliessenDownMsEndlage: number;
  endlageThresholdPercent: number;
  tiltUpMs25: number;
  tiltUpMs50: number;
  tiltUpMs75: number;
}

export const RETRO_LUX_DEFAULT_TIMINGS: RaffstoreRetroLuxTimings = {
  arbeitsstellungUpMs: 10_000,
  arbeitsstellungDownMs: 10_000,
  commandPauseMs: 500,
  schliessenUpMsDefault: 3_000,
  schliessenUpMsEndlage: 4_000,
  schliessenDownMsDefault: 4_000,
  schliessenDownMsEndlage: 4_000,
  endlageThresholdPercent: 95,
  tiltUpMs25: 1_000,
  tiltUpMs50: 800,
  tiltUpMs75: 600,
};

interface SequenceContext {
  sendCommand: (command: RaffstoreMotionCommand) => Promise<void>;
  getOpeningPercent?: () => number | null;
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
  timings?: Partial<RaffstoreRetroLuxTimings>;
}

interface ResolvedSequenceContext {
  sendCommand: (command: RaffstoreMotionCommand) => Promise<void>;
  getOpeningPercent: () => number | null;
  sleep: (ms: number, signal: AbortSignal) => Promise<void>;
  timings: RaffstoreRetroLuxTimings;
}

class SequenceAbortedError extends Error {
  constructor() {
    super("Raffstore sequence aborted");
    this.name = "SequenceAbortedError";
  }
}

const isAbortError = (error: unknown): boolean =>
  error instanceof SequenceAbortedError;

const defaultSleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new SequenceAbortedError());
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", abortHandler);
      resolve();
    }, ms);

    const abortHandler = () => {
      window.clearTimeout(timeoutId);
      reject(new SequenceAbortedError());
    };

    signal.addEventListener("abort", abortHandler, { once: true });
  });

const resolveContext = (context: SequenceContext): ResolvedSequenceContext => ({
  sendCommand: context.sendCommand,
  getOpeningPercent: context.getOpeningPercent ?? (() => null),
  sleep: context.sleep ?? defaultSleep,
  timings: {
    ...RETRO_LUX_DEFAULT_TIMINGS,
    ...context.timings,
  },
});

const assertNotAborted = (signal: AbortSignal): void => {
  if (signal.aborted) {
    throw new SequenceAbortedError();
  }
};

const sendFor = async (
  command: "UP" | "DOWN",
  durationMs: number,
  context: ResolvedSequenceContext,
  signal: AbortSignal
): Promise<void> => {
  const pauseMs = context.timings.commandPauseMs;

  const waitCommandPause = async (): Promise<void> => {
    if (pauseMs > 0) {
      await context.sleep(pauseMs, signal);
    }
  };

  assertNotAborted(signal);
  await context.sendCommand(command);
  await context.sleep(durationMs, signal);
  assertNotAborted(signal);
  await context.sendCommand("STOP");
  await waitCommandPause();
};

export const runArbeitsstellung = async (
  sequenceContext: SequenceContext,
  signal: AbortSignal
): Promise<void> => {
  const context = resolveContext(sequenceContext);
  await sendFor("UP", context.timings.arbeitsstellungUpMs, context, signal);
  await sendFor("DOWN", context.timings.arbeitsstellungDownMs, context, signal);
};

export const runSchliessen = async (
  sequenceContext: SequenceContext,
  signal: AbortSignal
): Promise<void> => {
  const context = resolveContext(sequenceContext);
  const openingPercent = context.getOpeningPercent();
  const isNearEndlage =
    openingPercent !== null && openingPercent >= context.timings.endlageThresholdPercent;

  const upDurationMs = isNearEndlage
    ? context.timings.schliessenUpMsEndlage
    : context.timings.schliessenUpMsDefault;
  const downDurationMs = isNearEndlage
    ? context.timings.schliessenDownMsEndlage
    : context.timings.schliessenDownMsDefault;

  await sendFor("UP", upDurationMs, context, signal);
  await sendFor("DOWN", downDurationMs, context, signal);
};

const getTiltDuration = (
  preset: RaffstoreTiltPreset,
  timings: RaffstoreRetroLuxTimings
): number => {
  if (preset === 25) {
    return timings.tiltUpMs25;
  }
  if (preset === 50) {
    return timings.tiltUpMs50;
  }
  return timings.tiltUpMs75;
};

export const runTiltPreset = async (
  sequenceContext: SequenceContext,
  preset: RaffstoreTiltPreset,
  signal: AbortSignal
): Promise<void> => {
  const context = resolveContext(sequenceContext);
  await runSchliessen(context, signal);
  await sendFor("UP", getTiltDuration(preset, context.timings), context, signal);
};

interface ActiveSequence {
  controller: AbortController;
  done: Promise<void>;
}

interface SequenceStart {
  done: Promise<void>;
}

export interface RaffstoreSequenceController {
  isRunning: () => boolean;
  cancel: () => Promise<void>;
  runArbeitsstellung: () => Promise<void>;
  runSchliessen: () => Promise<void>;
  runTiltPreset: (preset: RaffstoreTiltPreset) => Promise<void>;
  runManualCommand: (command: RaffstoreMotionCommand) => Promise<void>;
}

export const createRaffstoreSequenceController = (
  sequenceContext: SequenceContext
): RaffstoreSequenceController => {
  const context = resolveContext(sequenceContext);
  let activeSequence: ActiveSequence | null = null;
  let operationQueue = Promise.resolve();
  const pauseMs = context.timings.commandPauseMs;

  const waitWithoutAbort = async (ms: number): Promise<void> => {
    if (ms <= 0) {
      return;
    }
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });
  };

  const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    const next = operationQueue.then(task, task);
    operationQueue = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  };

  const awaitSequenceDone = async (done: Promise<void>): Promise<void> => {
    try {
      await done;
    } catch (error) {
      if (!isAbortError(error)) {
        throw error;
      }
    }
  };

  const cancelCurrentSequence = async (sendStop: boolean): Promise<boolean> => {
    const current = activeSequence;
    if (!current) {
      return false;
    }

    activeSequence = null;
    current.controller.abort();
    if (sendStop) {
      await context.sendCommand("STOP");
      await waitWithoutAbort(pauseMs);
    }

    try {
      await current.done;
    } catch (error) {
      if (!isAbortError(error)) {
        throw error;
      }
    }
    return true;
  };

  const beginSequence = async (
    runner: (signal: AbortSignal) => Promise<void>
  ): Promise<SequenceStart> => {
    await cancelCurrentSequence(true);

    const controller = new AbortController();
    const done = (async () => {
      try {
        await runner(controller.signal);
      } finally {
        if (activeSequence?.controller === controller) {
          activeSequence = null;
        }
      }
    })();

    activeSequence = {
      controller,
      done,
    };
    return { done };
  };

  return {
    isRunning: () => activeSequence !== null,
    cancel: () =>
      enqueue(async () => {
        await cancelCurrentSequence(true);
      }),
    runArbeitsstellung: async () => {
      const started = await enqueue(async () =>
        beginSequence((signal) => runArbeitsstellung(context, signal))
      );
      await awaitSequenceDone(started.done);
    },
    runSchliessen: async () => {
      const started = await enqueue(async () =>
        beginSequence((signal) => runSchliessen(context, signal))
      );
      await awaitSequenceDone(started.done);
    },
    runTiltPreset: async (preset) => {
      const started = await enqueue(async () =>
        beginSequence((signal) => runTiltPreset(context, preset, signal))
      );
      await awaitSequenceDone(started.done);
    },
    runManualCommand: (command) =>
      enqueue(async () => {
        const hadRunningSequence = await cancelCurrentSequence(true);
        if (command === "STOP") {
          if (!hadRunningSequence) {
            await context.sendCommand("STOP");
          }
          return;
        }
        await context.sendCommand(command);
      }),
  };
};
