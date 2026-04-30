import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyViewItemStateUpdate } from "../../../stores/viewStore.utils";
import { resetViewStoreForTests, useViewStore } from "../../../stores/viewStore";
import type { EvccControlDefinition } from "../controlDefinitions";
import { EvccHudControl, EvccOverlayControl } from ".";

const mocks = vi.hoisted(() => ({
  sendCommand: vi.fn(),
  subscribeWebSocketListener: vi.fn(),
  websocketIsConnected: vi.fn(() => false),
  websocketSendCommand: vi.fn(),
}));

vi.mock("../../../services/openhab-service", () => ({
  fetchItemsMetadata: vi.fn(),
  sendCommand: mocks.sendCommand,
}));

vi.mock("../../../services/websocket-service", () => ({
  subscribeWebSocketListener: mocks.subscribeWebSocketListener,
  WebSocketService: {
    isConnected: mocks.websocketIsConnected,
    sendCommand: mocks.websocketSendCommand,
  },
}));

const itemRefs = {
  connectedItemName: "EVCC_Garage_Connected",
  chargingItemName: "EVCC_Garage_Charging",
  modeItemName: "EVCC_Garage_Mode",
  limitSocItemName: "EVCC_Garage_LimitSoC",
  vehicleSocItemName: "EVCC_Garage_VehicleSoC",
  vehicleRangeItemName: "EVCC_Garage_VehicleRange",
  vehicleNameItemName: "EVCC_Garage_VehicleName",
  vehicleTitleItemName: "EVCC_Garage_VehicleTitle",
  activePhasesItemName: "EVCC_Garage_ActivePhases",
  chargePowerItemName: "EVCC_Garage_ChargePower",
  effectiveLimitSocItemName: "EVCC_Garage_EffectiveLimitSoC",
  effectivePlanIdItemName: "EVCC_Garage_EffectivePlanId",
  effectivePlanSocItemName: "EVCC_Garage_EffectivePlanSoC",
  effectivePlanTimeItemName: "EVCC_Garage_EffectivePlanTime",
  repeatingPlanActiveItemName: "EVCC_EV6_Repeating_Plan_1_Active",
} as const;

const definition: EvccControlDefinition = {
  controlId: "EVCC_Garage",
  controlType: "evcc",
  label: "EVCC Garage",
  itemRefs,
  layoutMetadataItemNames: [],
  defaultPosition: { x: 0, y: 0 },
};

const setItemStates = (states: Record<string, string>) => {
  useViewStore.setState({
    itemStates: Object.fromEntries(
      Object.entries(states).map(([itemName, rawState]) => [
        itemName,
        applyViewItemStateUpdate(undefined, rawState),
      ])
    ),
  });
};

const baseHudStates = (vehicleSocRawState: string): Record<string, string> => ({
  [itemRefs.connectedItemName]: "ON",
  [itemRefs.chargingItemName]: "OFF",
  [itemRefs.modeItemName]: "pv",
  [itemRefs.limitSocItemName]: "80 %",
  [itemRefs.vehicleSocItemName]: vehicleSocRawState,
  [itemRefs.vehicleRangeItemName]: "312 km",
  [itemRefs.vehicleNameItemName]: "EV6",
  [itemRefs.vehicleTitleItemName]: "Kia EV6",
  [itemRefs.activePhasesItemName]: "1",
  [itemRefs.chargePowerItemName]: "UNDEF",
  [itemRefs.effectiveLimitSocItemName]: "80 %",
  [itemRefs.effectivePlanIdItemName]: "1",
  [itemRefs.effectivePlanSocItemName]: "50 %",
  [itemRefs.effectivePlanTimeItemName]: "2099-05-01T05:50:00",
  [itemRefs.repeatingPlanActiveItemName]: "ON",
});

describe("EvccOverlayControl", () => {
  beforeEach(() => {
    resetViewStoreForTests();
    mocks.sendCommand.mockReset();
    mocks.websocketSendCommand.mockReset();
    mocks.websocketIsConnected.mockReset();
    mocks.websocketIsConnected.mockReturnValue(false);
  });

  it("renders the status column with SoC, charging power, logo, and unlabeled range", () => {
    setItemStates({
      [itemRefs.connectedItemName]: "ON",
      [itemRefs.chargingItemName]: "ON",
      [itemRefs.modeItemName]: "pv",
      [itemRefs.limitSocItemName]: "80 %",
      [itemRefs.vehicleSocItemName]: "65 %",
      [itemRefs.vehicleRangeItemName]: "312 km",
      [itemRefs.vehicleNameItemName]: "EV6",
      [itemRefs.vehicleTitleItemName]: "Kia EV6",
      [itemRefs.activePhasesItemName]: "3",
      [itemRefs.chargePowerItemName]: "7340 W",
      [itemRefs.effectiveLimitSocItemName]: "80 %",
      [itemRefs.effectivePlanIdItemName]: "1",
      [itemRefs.effectivePlanSocItemName]: "50 %",
      [itemRefs.effectivePlanTimeItemName]: "2099-05-01T05:50:00",
      [itemRefs.repeatingPlanActiveItemName]: "ON",
    });

    render(<EvccOverlayControl definition={definition} onClose={vi.fn()} />);

    expect(
      screen.getByTestId(`living-evcc-overlay-state-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("65%");
    expect(
      screen.getByTestId(`living-evcc-overlay-power-${itemRefs.connectedItemName}`)
    ).toHaveTextContent(/\(7[,.]3 kW\)/);
    expect(
      screen.getByTestId(
        `living-evcc-overlay-logo-${itemRefs.connectedItemName}-kia`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`living-evcc-overlay-range-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("312 km");
    expect(
      screen.getByTestId(
        `living-evcc-overlay-plan-status-${itemRefs.connectedItemName}`
      )
    ).toHaveTextContent("Wiederholender Plan");
    expect(
      screen.getByTestId(
        `living-evcc-overlay-plan-details-${itemRefs.connectedItemName}`
      )
    ).toHaveTextContent(/50% bis/);

    expect(screen.queryByText("Lädt")).not.toBeInTheDocument();
    expect(screen.queryByText(/Fahrzeug:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Reichweite:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Modus:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Limit:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Phasen:/)).not.toBeInTheDocument();
  });

  it("falls back to connected text and vehicle name when values are missing", () => {
    setItemStates({
      [itemRefs.connectedItemName]: "ON",
      [itemRefs.chargingItemName]: "OFF",
      [itemRefs.modeItemName]: "pv",
      [itemRefs.limitSocItemName]: "80 %",
      [itemRefs.vehicleSocItemName]: "UNDEF",
      [itemRefs.vehicleRangeItemName]: "UNDEF",
      [itemRefs.vehicleNameItemName]: "Born",
      [itemRefs.vehicleTitleItemName]: "Cupra Born",
      [itemRefs.activePhasesItemName]: "1",
      [itemRefs.chargePowerItemName]: "UNDEF",
      [itemRefs.effectiveLimitSocItemName]: "80 %",
      [itemRefs.effectivePlanIdItemName]: "UNDEF",
      [itemRefs.effectivePlanSocItemName]: "UNDEF",
      [itemRefs.effectivePlanTimeItemName]: "UNDEF",
      [itemRefs.repeatingPlanActiveItemName]: "OFF",
    });

    render(<EvccOverlayControl definition={definition} onClose={vi.fn()} />);

    expect(
      screen.getByTestId(`living-evcc-overlay-state-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("Verbunden");
    expect(
      screen.getByTestId(`living-evcc-overlay-vehicle-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("Cupra Born");
  });

  it("renders the HUD vehicle logo, SoC, range, and blue plan status surfaces", () => {
    setItemStates(baseHudStates("65 %"));

    render(
      <EvccHudControl
        definition={definition}
        onOpenControl={vi.fn()}
      />
    );

    expect(screen.getByTestId("living-control-evcc-logo-kia")).toBeInTheDocument();
    expect(
      screen.getByTestId("living-control-evcc-logo-kia").parentElement
    ).toHaveClass("rounded-tl-md");
    expect(
      screen.getByTestId(`living-control-evcc-values-${itemRefs.connectedItemName}`)
    ).toHaveClass("bg-black/85");
    expect(
      screen.getByTestId(`living-control-evcc-values-${itemRefs.connectedItemName}`)
    ).toHaveClass("rounded-tr-md");
    expect(
      screen.getByTestId(`living-control-evcc-soc-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("65%");
    expect(
      screen.getByTestId(`living-control-evcc-range-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("312 km");
    expect(
      screen.getByTestId(`living-control-evcc-plan-${itemRefs.connectedItemName}`)
    ).toHaveClass("bg-blue-600/85");
    expect(
      screen.getByTestId(`living-control-evcc-plan-${itemRefs.connectedItemName}`)
    ).toHaveClass("w-full");
    expect(
      screen.getByTestId(`living-control-evcc-plan-${itemRefs.connectedItemName}`)
    ).toHaveClass("rounded-b-md");
    expect(
      screen.getByTestId(`living-control-evcc-plan-${itemRefs.connectedItemName}`)
    ).toHaveTextContent(/50% bis/);
    expect(
      screen.getByTestId(`living-control-evcc-plan-${itemRefs.connectedItemName}`)
    ).not.toHaveTextContent("Wiederholender Plan");
  });

  it("colors the HUD SoC progress ring by charge level", () => {
    setItemStates(baseHudStates("14 %"));
    const { rerender } = render(
      <EvccHudControl
        definition={definition}
        onOpenControl={vi.fn()}
      />
    );

    expect(screen.getByTestId("living-control-evcc-soc-ring-44")).toHaveAttribute(
      "stroke",
      "#f43f5e"
    );

    act(() => {
      setItemStates(baseHudStates("49 %"));
    });
    rerender(
      <EvccHudControl
        definition={definition}
        onOpenControl={vi.fn()}
      />
    );
    expect(screen.getByTestId("living-control-evcc-soc-ring-44")).toHaveAttribute(
      "stroke",
      "#f59e0b"
    );

    act(() => {
      setItemStates(baseHudStates("50 %"));
    });
    rerender(
      <EvccHudControl
        definition={definition}
        onOpenControl={vi.fn()}
      />
    );
    expect(screen.getByTestId("living-control-evcc-soc-ring-44")).toHaveAttribute(
      "stroke",
      "#22c55e"
    );
  });

  it("writes limit changes only to the live EVCC limit SoC item", async () => {
    const user = userEvent.setup();
    setItemStates({
      [itemRefs.connectedItemName]: "ON",
      [itemRefs.chargingItemName]: "OFF",
      [itemRefs.modeItemName]: "pv",
      [itemRefs.limitSocItemName]: "80 %",
      [itemRefs.vehicleSocItemName]: "65 %",
      [itemRefs.vehicleRangeItemName]: "312 km",
      [itemRefs.vehicleNameItemName]: "EV6",
      [itemRefs.vehicleTitleItemName]: "Kia EV6",
      [itemRefs.activePhasesItemName]: "1",
      [itemRefs.chargePowerItemName]: "UNDEF",
      [itemRefs.effectiveLimitSocItemName]: "80 %",
      [itemRefs.effectivePlanIdItemName]: "UNDEF",
      [itemRefs.effectivePlanSocItemName]: "UNDEF",
      [itemRefs.effectivePlanTimeItemName]: "UNDEF",
      [itemRefs.repeatingPlanActiveItemName]: "OFF",
    });

    render(<EvccOverlayControl definition={definition} onClose={vi.fn()} />);
    await user.click(
      screen.getByTestId(
        `living-evcc-overlay-limit-${itemRefs.connectedItemName}-50`
      )
    );

    expect(mocks.sendCommand).toHaveBeenCalledWith(
      "EVCC_Garage_LimitSoC",
      "50"
    );
    expect(mocks.sendCommand).toHaveBeenCalledTimes(1);
  });

  it("toggles only the repeating plan active item and does not render one-time plan controls", async () => {
    const user = userEvent.setup();
    setItemStates({
      [itemRefs.connectedItemName]: "ON",
      [itemRefs.chargingItemName]: "OFF",
      [itemRefs.modeItemName]: "pv",
      [itemRefs.limitSocItemName]: "80 %",
      [itemRefs.vehicleSocItemName]: "65 %",
      [itemRefs.vehicleRangeItemName]: "312 km",
      [itemRefs.vehicleNameItemName]: "EV6",
      [itemRefs.vehicleTitleItemName]: "Kia EV6",
      [itemRefs.activePhasesItemName]: "1",
      [itemRefs.chargePowerItemName]: "UNDEF",
      [itemRefs.effectiveLimitSocItemName]: "80 %",
      [itemRefs.effectivePlanIdItemName]: "UNDEF",
      [itemRefs.effectivePlanSocItemName]: "UNDEF",
      [itemRefs.effectivePlanTimeItemName]: "UNDEF",
      [itemRefs.repeatingPlanActiveItemName]: "OFF",
    });

    render(<EvccOverlayControl definition={definition} onClose={vi.fn()} />);
    await user.click(
      screen.getByTestId(
        `living-evcc-overlay-repeating-plan-${itemRefs.connectedItemName}`
      )
    );

    expect(mocks.sendCommand).toHaveBeenCalledWith(
      "EVCC_EV6_Repeating_Plan_1_Active",
      "ON"
    );
    expect(mocks.sendCommand).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Einmalplan Ziel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Datum/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Uhrzeit/i)).not.toBeInTheDocument();
  });
});
