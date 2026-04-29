import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyViewItemStateUpdate } from "../../../stores/viewStore.utils";
import { resetViewStoreForTests, useViewStore } from "../../../stores/viewStore";
import type { EvccControlDefinition } from "../controlDefinitions";
import { EvccOverlayControl } from ".";

vi.mock("../../../services/openhab-service", () => ({
  fetchItemsMetadata: vi.fn(),
  sendCommand: vi.fn(),
}));

vi.mock("../../../services/websocket-service", () => ({
  subscribeWebSocketListener: vi.fn(),
  WebSocketService: {
    isConnected: vi.fn(() => false),
    sendCommand: vi.fn(),
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

describe("EvccOverlayControl", () => {
  beforeEach(() => {
    resetViewStoreForTests();
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
    });

    render(<EvccOverlayControl definition={definition} onClose={vi.fn()} />);

    expect(
      screen.getByTestId(`living-evcc-overlay-state-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("Verbunden");
    expect(
      screen.getByTestId(`living-evcc-overlay-vehicle-${itemRefs.connectedItemName}`)
    ).toHaveTextContent("Cupra Born");
  });
});
