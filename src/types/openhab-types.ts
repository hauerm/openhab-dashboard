// OpenHAB Item Types and Command Types
// Based on OpenHAB documentation and ItemCommandEvent specifications

export type OpenHABItemType =
  | "Call"
  | "Color"
  | "Contact"
  | "DateTime"
  | "Dimmer"
  | "Group"
  | "Image"
  | "Location"
  | "Number"
  | "Number:Temperature"
  | "Number:Power"
  | "Number:Humidity"
  | "Number:Pressure"
  | "Number:CO2"
  | "Number:AQI"
  | "Player"
  | "Rollershutter"
  | "String"
  | "Switch";

export type OpenHABCommandType =
  | "String"
  | "DateTime"
  | "Decimal"
  | "Percent"
  | "Quantity"
  | "HSB"
  | "Point"
  | "IncreaseDecrease"
  | "NextPrevious"
  | "OnOff"
  | "OpenClosed"
  | "PlayPause"
  | "RewindFastforward"
  | "Refresh"
  | "StopMove"
  | "UpDown";

export type OpenHABStateType = OpenHABCommandType;

export interface OpenHABCommandPayload {
  type: OpenHABCommandType;
  value: string;
}

export interface OpenHABItemCommandEvent {
  type: "ItemCommandEvent";
  topic: string;
  payload: OpenHABCommandPayload;
  source?: string;
}

export interface OpenHABItemStateEvent {
  type: "ItemStateEvent";
  topic: string;
  payload: {
    type: OpenHABStateType;
    value: string;
  };
  source?: string;
}

export type OpenHABEvent = OpenHABItemCommandEvent | OpenHABItemStateEvent;

// Type mappings for common item types and their accepted commands
export const ITEM_TYPE_COMMAND_MAP: Record<string, OpenHABCommandType[]> = {
  Switch: ["OnOff"],
  Dimmer: ["OnOff", "IncreaseDecrease", "Percent"],
  Color: ["OnOff", "HSB", "Percent", "IncreaseDecrease"],
  Rollershutter: ["UpDown", "StopMove", "Percent"],
  Player: ["PlayPause", "NextPrevious", "RewindFastforward"],
  Number: ["Decimal", "IncreaseDecrease"],
  "Number:Temperature": ["Quantity", "IncreaseDecrease"],
  "Number:Power": ["Quantity", "IncreaseDecrease"],
  "Number:Humidity": ["Quantity", "IncreaseDecrease"],
  "Number:Pressure": ["Quantity", "IncreaseDecrease"],
  "Number:CO2": ["Quantity", "IncreaseDecrease"],
  "Number:AQI": ["Quantity", "IncreaseDecrease"],
  String: ["String"],
  DateTime: ["DateTime"],
  Contact: ["OpenClosed"],
  Group: ["Refresh"],
  Call: ["String"],
  Location: ["Point"],
  Image: ["Refresh"],
};

// Helper function to get accepted command types for an item type
export function getAcceptedCommandTypes(
  itemType: OpenHABItemType
): OpenHABCommandType[] {
  return ITEM_TYPE_COMMAND_MAP[itemType] || [];
}

// Helper function to validate if a command type is accepted for an item type
export function isValidCommandForItem(
  itemType: OpenHABItemType,
  commandType: OpenHABCommandType
): boolean {
  const acceptedTypes = getAcceptedCommandTypes(itemType);
  return acceptedTypes.includes(commandType);
}
