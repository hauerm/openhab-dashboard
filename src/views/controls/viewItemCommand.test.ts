import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetViewStoreForTests, useViewStore } from "../../stores/viewStore";
import { sendViewItemCommand } from "./viewItemCommand";

const mocks = vi.hoisted(() => ({
  sendCommand: vi.fn(),
  websocketIsConnected: vi.fn(),
  websocketSendCommand: vi.fn(),
}));

vi.mock("../../services/openhab-service", () => ({
  sendCommand: mocks.sendCommand,
}));

vi.mock("../../services/websocket-service", () => ({
  WebSocketService: {
    isConnected: mocks.websocketIsConnected,
    sendCommand: mocks.websocketSendCommand,
  },
}));

describe("sendViewItemCommand", () => {
  beforeEach(() => {
    resetViewStoreForTests();
    mocks.sendCommand.mockReset();
    mocks.websocketIsConnected.mockReset();
    mocks.websocketIsConnected.mockReturnValue(false);
    mocks.websocketSendCommand.mockReset();
  });

  it("sets optimistic item state before sending the command", async () => {
    mocks.sendCommand.mockResolvedValue(undefined);

    const commandPromise = sendViewItemCommand("Light_Test", "ON", "OnOff", {
      optimisticRawState: "ON",
    });

    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "ON",
      effectiveState: "on",
    });

    await commandPromise;
  });

  it("rolls back optimistic state when sending fails", async () => {
    useViewStore.getState().setOptimisticItemState("Light_Test", "OFF");
    mocks.sendCommand.mockRejectedValue(new Error("network failed"));

    await expect(
      sendViewItemCommand("Light_Test", "ON", "OnOff", {
        optimisticRawState: "ON",
      })
    ).rejects.toThrow("network failed");

    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "OFF",
      effectiveState: "off",
    });
  });

  it("does not roll back when a real item update arrived after the optimistic state", async () => {
    let rejectCommand!: (error: Error) => void;
    mocks.sendCommand.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectCommand = reject;
      })
    );

    const commandPromise = sendViewItemCommand("Light_Test", "ON", "OnOff", {
      optimisticRawState: "ON",
    });

    useViewStore.getState().handleItemStateUpdate("Light_Test", "OFF");
    rejectCommand(new Error("network failed"));

    await expect(commandPromise).rejects.toThrow("network failed");
    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "OFF",
      effectiveState: "off",
    });
    expect(
      useViewStore.getState().itemStates.Light_Test.optimisticUpdateId
    ).toBeUndefined();
  });
});
