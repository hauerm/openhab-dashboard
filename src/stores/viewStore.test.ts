import { beforeEach, describe, expect, it } from "vitest";
import { resetViewStoreForTests, useViewStore } from "./viewStore";

describe("viewStore optimistic item states", () => {
  beforeEach(() => {
    resetViewStoreForTests();
  });

  it("sets optimistic ON/OFF states immediately", () => {
    const onSnapshot = useViewStore
      .getState()
      .setOptimisticItemState("Light_Test", "ON");

    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "ON",
      effectiveState: "on",
      optimisticUpdateId: onSnapshot.optimisticUpdateId,
    });

    const offSnapshot = useViewStore
      .getState()
      .setOptimisticItemState("Light_Test", "OFF");

    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "OFF",
      effectiveState: "off",
      optimisticUpdateId: offSnapshot.optimisticUpdateId,
    });
  });

  it("lets real item updates replace optimistic state", () => {
    const snapshot = useViewStore
      .getState()
      .setOptimisticItemState("Light_Test", "ON");

    useViewStore.getState().handleItemStateUpdate("Light_Test", "OFF");
    useViewStore.getState().rollbackOptimisticItemState(snapshot);

    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "OFF",
      effectiveState: "off",
    });
    expect(
      useViewStore.getState().itemStates.Light_Test.optimisticUpdateId
    ).toBeUndefined();
  });

  it("rolls back only the still-current optimistic update", () => {
    const firstSnapshot = useViewStore
      .getState()
      .setOptimisticItemState("Light_Test", "ON");
    const secondSnapshot = useViewStore
      .getState()
      .setOptimisticItemState("Light_Test", "OFF");

    useViewStore.getState().rollbackOptimisticItemState(firstSnapshot);
    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "OFF",
      effectiveState: "off",
      optimisticUpdateId: secondSnapshot.optimisticUpdateId,
    });

    useViewStore.getState().rollbackOptimisticItemState(secondSnapshot);
    expect(useViewStore.getState().itemStates.Light_Test).toMatchObject({
      rawState: "ON",
      effectiveState: "on",
      optimisticUpdateId: firstSnapshot.optimisticUpdateId,
    });
  });
});
