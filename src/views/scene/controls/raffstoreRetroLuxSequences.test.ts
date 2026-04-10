import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRaffstoreSequenceController,
  RETRO_LUX_DEFAULT_TIMINGS,
  runSchliessen,
  runTiltPreset,
  type RaffstoreMotionCommand,
} from "./raffstoreRetroLuxSequences";

describe("raffstoreRetroLuxSequences", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("uses close timings 4s/4s near endlage and 3s/4s otherwise", async () => {
    const commandsNearEndlage: RaffstoreMotionCommand[] = [];
    const sleepNearEndlage: number[] = [];
    await runSchliessen(
      {
        sendCommand: async (command) => {
          commandsNearEndlage.push(command);
        },
        timings: { commandPauseMs: 0 },
        getOpeningPercent: () => 95,
        sleep: async (ms) => {
          sleepNearEndlage.push(ms);
        },
      },
      new AbortController().signal
    );

    expect(sleepNearEndlage).toEqual([4_000, 4_000]);
    expect(commandsNearEndlage).toEqual(["UP", "STOP", "DOWN", "STOP"]);

    const commandsNormal: RaffstoreMotionCommand[] = [];
    const sleepNormal: number[] = [];
    await runSchliessen(
      {
        sendCommand: async (command) => {
          commandsNormal.push(command);
        },
        timings: { commandPauseMs: 0 },
        getOpeningPercent: () => 67,
        sleep: async (ms) => {
          sleepNormal.push(ms);
        },
      },
      new AbortController().signal
    );

    expect(sleepNormal).toEqual([3_000, 4_000]);
    expect(commandsNormal).toEqual(["UP", "STOP", "DOWN", "STOP"]);
  });

  it("normalizes with close sequence before tilt presets", async () => {
    const commands: RaffstoreMotionCommand[] = [];
    const sleepDurations: number[] = [];

    await runTiltPreset(
      {
        sendCommand: async (command) => {
          commands.push(command);
        },
        timings: { commandPauseMs: 0 },
        getOpeningPercent: () => null,
        sleep: async (ms) => {
          sleepDurations.push(ms);
        },
      },
      25,
      new AbortController().signal
    );

    expect(commands).toEqual(["UP", "STOP", "DOWN", "STOP", "UP", "STOP"]);
    expect(sleepDurations).toEqual([
      RETRO_LUX_DEFAULT_TIMINGS.schliessenUpMsDefault,
      RETRO_LUX_DEFAULT_TIMINGS.schliessenDownMsDefault,
      RETRO_LUX_DEFAULT_TIMINGS.tiltUpMs25,
    ]);
  });

  it("aborts running sequence and starts a new one immediately", async () => {
    vi.useFakeTimers();

    const commandLog: RaffstoreMotionCommand[] = [];
    const controller = createRaffstoreSequenceController({
      sendCommand: async (command) => {
        commandLog.push(command);
      },
      timings: { commandPauseMs: 0 },
      getOpeningPercent: () => 67,
    });

    const waitForCommandCount = async (count: number): Promise<void> => {
      for (let index = 0; index < 20 && commandLog.length < count; index += 1) {
        await vi.advanceTimersByTimeAsync(0);
        await Promise.resolve();
      }
    };

    const firstRun = controller.runArbeitsstellung();
    await waitForCommandCount(1);
    expect(commandLog).toEqual(["UP"]);

    const secondRun = controller.runSchliessen();
    await waitForCommandCount(3);
    expect(commandLog.slice(0, 3)).toEqual(["UP", "STOP", "UP"]);

    await vi.advanceTimersByTimeAsync(8_000);
    await Promise.all([firstRun, secondRun]);

    expect(commandLog).toEqual(["UP", "STOP", "UP", "STOP", "DOWN", "STOP"]);
  });
});
