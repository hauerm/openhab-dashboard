import { describe, expect, it } from "vitest";
import type { Item, ItemMetadataNamespace } from "../types/item";
import {
  buildOpenHABSemanticModel,
  itemBelongsToLocation,
  itemHasSemanticProperty,
} from "./openhab-model";
import {
  PROPERTY_CO2,
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
} from "./openhab-properties";

const createItem = (
  name: string,
  type: string,
  tags: string[],
  groupNames: string[] = [],
  options: {
    label?: string;
    state?: string;
    metadata?: Record<string, ItemMetadataNamespace>;
  } = {}
): Item => ({
  link: `/items/${name}`,
  state: options.state ?? "0",
  editable: true,
  type,
  name,
  label: options.label,
  tags,
  groupNames,
  metadata: options.metadata,
});

const fixtureItems = (): Item[] => [
  createItem("Hauer", "Group", ["Location"], [], {
    label: "Adresse",
    metadata: {
      "dashboard-location": {
        value: "v1",
        config: { order: 0 },
      },
    },
  }),
  createItem("EG", "Group", ["GroundFloor"], ["Hauer"], {
    label: "Erdgeschoss",
    metadata: {
      "dashboard-location": {
        value: "v1",
        config: { order: 10 },
      },
    },
  }),
  createItem("Wohnzimmer", "Group", ["LivingRoom"], ["EG"], {
    label: "Wohnzimmer",
    metadata: {
      "dashboard-location": {
        value: "v1",
        config: { order: 20 },
      },
    },
  }),
  createItem("Garage", "Group", ["Garage"], ["Hauer"], {
    label: "Garage",
    metadata: {
      "dashboard-location": {
        value: "v1",
        config: { order: 30 },
      },
    },
  }),
  createItem("Essen", "Group", ["DiningRoom"], ["EG"], {
    label: "Essen",
  }),
  createItem("Healthy_Home_Coach", "Group", ["Sensor"], ["Essen"], {
    label: "Healthy Home Coach",
  }),
  createItem(
    "Healthy_Home_Coach_Temperature",
    "Number:Temperature",
    ["Measurement", "Temperature"],
    ["Healthy_Home_Coach"]
  ),
  createItem(
    "Healthy_Home_Coach_Humidity",
    "Number:Dimensionless",
    ["Measurement", "Humidity"],
    ["Healthy_Home_Coach"]
  ),
  createItem(
    "Healthy_Home_Coach_CO2",
    "Number:Dimensionless",
    ["Measurement", "CO2"],
    ["Healthy_Home_Coach"]
  ),
  createItem("Equ_Spots_Couch", "Group", ["Chandelier"], ["Wohnzimmer"], {
    label: "Spots Couch",
  }),
  createItem("Light_Couch", "Switch", ["Light", "Switch"], ["Equ_Spots_Couch"]),
  createItem("Equ_Raffstore", "Group", ["Blinds"], ["Wohnzimmer"], {
    label: "Raffstore",
  }),
  createItem(
    "Raffstore_Left",
    "Rollershutter",
    ["Control", "Opening"],
    ["Equ_Raffstore"],
    {
      metadata: {
        automation: {
          value: "raffstore",
          config: {
            openOnSunrise: true,
            closeOnSunset: true,
            closeIfHot: false,
          },
        },
      },
    }
  ),
  createItem(
    "Raffstore_Right",
    "Rollershutter",
    ["Control", "Opening"],
    ["Equ_Raffstore"],
    {
      metadata: {
        automation: {
          value: "raffstore",
          config: {
            openOnSunrise: true,
            closeOnSunset: true,
            closeIfHot: false,
          },
        },
      },
    }
  ),
  createItem("KNX_Hormann_Garagentor", "Group", ["GarageDoor"], ["Garage"], {
    label: "KNX Hörmann Garagentor",
  }),
  createItem(
    "KNX_Hormann_Garagentor_Garagentor",
    "Rollershutter",
    ["Control", "Opening"],
    ["KNX_Hormann_Garagentor"],
    {
      metadata: {
        automation: {
          value: "garagedoor",
        },
      },
    }
  ),
  createItem("EVCC_Garage", "Group", ["EVSE"], ["Garage"], {
    label: "EVCC Garage",
  }),
  createItem(
    "EVCC_Garage_Connected",
    "Switch",
    ["Status", "Presence"],
    ["EVCC_Garage"]
  ),
  createItem(
    "EVCC_Garage_Charging",
    "Switch",
    ["Status", "Energy"],
    ["EVCC_Garage"]
  ),
  createItem("EVCC_Garage_Mode", "String", ["Control"], ["EVCC_Garage"]),
  createItem(
    "EVCC_Garage_LimitSoC",
    "Number:Dimensionless",
    ["Control", "Level"],
    ["EVCC_Garage"]
  ),
  createItem(
    "EVCC_Garage_VehicleSoC",
    "Number:Dimensionless",
    ["Measurement", "Level"],
    ["EVCC_Garage"]
  ),
  createItem(
    "EVCC_Garage_VehicleRange",
    "Number:Length",
    ["Measurement"],
    ["EVCC_Garage"]
  ),
  createItem("EVCC_Garage_VehicleName", "String", ["Status"], ["EVCC_Garage"]),
  createItem("EVCC_Garage_VehicleTitle", "String", ["Status"], ["EVCC_Garage"]),
  createItem("EVCC_Garage_ActivePhases", "Number", ["Status"], ["EVCC_Garage"]),
  createItem(
    "EVCC_Garage_ChargePower",
    "Number:Power",
    ["Measurement", "Power"],
    ["EVCC_Garage"]
  ),
  createItem(
    "EVCC_Garage_EffectiveLimitSoC",
    "Number:Dimensionless",
    ["Status", "Level"],
    ["EVCC_Garage"]
  ),
  createItem("EVCC_Garage_EffectivePlanId", "Number", ["Status"], ["EVCC_Garage"]),
  createItem(
    "EVCC_Garage_EffectivePlanSoC",
    "Number:Dimensionless",
    ["Status", "Level"],
    ["EVCC_Garage"]
  ),
  createItem(
    "EVCC_Garage_EffectivePlanTime",
    "DateTime",
    ["Status"],
    ["EVCC_Garage"]
  ),
  createItem(
    "EVCC_EV6_Repeating_Plan_1_Active",
    "Switch",
    ["Control"],
    []
  ),
  createItem("Samsung_TV", "Group", ["Television"], ["Wohnzimmer"]),
  createItem("Samsung_TV_Power", "Switch", ["Enabled", "Switch"], ["Samsung_TV"]),
  createItem("Samsung_TV_Application", "String", ["App", "Control"], ["Samsung_TV"]),
  createItem("Samsung_TV_Kanal", "String", ["Channel", "Status"], ["Samsung_TV"]),
  createItem("Samsung_TV_Kanalnummer", "Number", ["Channel", "Control"], ["Samsung_TV"]),
  createItem("Samsung_TV_Titel", "String", ["Point"], ["Samsung_TV"]),
  createItem("Shelly_Plug", "Group", ["PowerOutlet"], ["Wohnzimmer"]),
  createItem("Shelly_Plug_Betrieb", "Switch", ["Power", "Switch"], ["Shelly_Plug"]),
  createItem(
    "Shelly_Plug_Consumption",
    "Number:Power",
    ["Measurement", "Power"],
    ["Shelly_Plug"]
  ),
  createItem("KNX_Helios", "Group", ["HVAC"], ["EG"]),
  createItem("KNX_Helios_ManualMode", "Number", ["Level", "Manual"], ["KNX_Helios"]),
  createItem("KNX_Helios_Ist_Stufe", "Number", ["Level", "Status"], ["KNX_Helios"]),
];

describe("buildOpenHABSemanticModel", () => {
  it("discovers ordered locations including root", () => {
    const model = buildOpenHABSemanticModel(fixtureItems());

    expect(model.locations.map((location) => location.name).slice(0, 3)).toEqual([
      "Hauer",
      "EG",
      "Wohnzimmer",
    ]);
    expect(model.rootLocationNames).toEqual(["Hauer"]);
    expect(model.childLocationNamesByParentName.Hauer).toEqual(["EG", "Garage"]);
    expect(model.childLocationNamesByParentName.EG).toEqual(["Wohnzimmer", "Essen"]);
  });

  it("traverses point to equipment to location for sidebar filtering", () => {
    const items = fixtureItems();
    const humidity = items.find((item) => item.name === "Healthy_Home_Coach_Humidity")!;

    expect(itemBelongsToLocation(humidity, "Essen", items, "direct")).toBe(true);
    expect(itemBelongsToLocation(humidity, "EG", items, "descendants")).toBe(true);
    expect(itemHasSemanticProperty(humidity, PROPERTY_HUMIDITY)).toBe(true);
    expect(itemHasSemanticProperty(humidity, PROPERTY_TEMPERATURE)).toBe(false);
  });

  it("maps supported equipment to dashboard controls in their direct location", () => {
    const model = buildOpenHABSemanticModel(fixtureItems());
    const livingControls = model.controlsByLocation.Wohnzimmer ?? [];
    const egControls = model.controlsByLocation.EG ?? [];
    const garageControls = model.controlsByLocation.Garage ?? [];

    expect(livingControls.map((control) => control.controlType)).toEqual([
      "light",
      "opening",
      "tv",
      "power",
    ]);
    expect(egControls.map((control) => control.controlType)).toEqual(["ventilation"]);
    expect(garageControls.map((control) => control.controlType)).toEqual([
      "opening",
      "evcc",
    ]);
  });

  it("maps color light equipment to rgbw light controls", () => {
    const model = buildOpenHABSemanticModel([
      ...fixtureItems(),
      createItem("Equ_LED_Strip", "Group", ["LightStrip"], ["Wohnzimmer"], {
        label: "LED Strip",
      }),
      createItem("LED_Strip_Color", "Color", ["Light", "Control"], ["Equ_LED_Strip"]),
    ]);

    const rgbwControl = model.controls.find(
      (control) => control.controlId === "Equ_LED_Strip"
    );

    expect(rgbwControl?.controlType).toBe("rgbw-light");
    if (!rgbwControl || rgbwControl.controlType !== "rgbw-light") {
      throw new Error("Expected RGBW light control");
    }
    expect(rgbwControl.itemRefs.colorItemName).toBe("LED_Strip_Color");
  });

  it("maps dimmer light equipment to dimmer controls while switches stay light controls", () => {
    const model = buildOpenHABSemanticModel([
      ...fixtureItems(),
      createItem("Equ_Dimmed_Spots", "Group", ["Chandelier"], ["Wohnzimmer"], {
        label: "Dimmed Spots",
      }),
      createItem(
        "Dimmed_Spots_Brightness",
        "Dimmer",
        ["Light", "Control"],
        ["Equ_Dimmed_Spots"]
      ),
    ]);

    const switchControl = model.controls.find(
      (control) => control.controlId === "Equ_Spots_Couch"
    );
    const dimmerControl = model.controls.find(
      (control) => control.controlId === "Equ_Dimmed_Spots"
    );

    expect(switchControl?.controlType).toBe("light");
    expect(dimmerControl?.controlType).toBe("dimmer");
    if (!dimmerControl || dimmerControl.controlType !== "dimmer") {
      throw new Error("Expected dimmer control");
    }
    expect(dimmerControl.itemRefs.itemName).toBe("Dimmed_Spots_Brightness");
  });

  it("aggregates multi-point opening equipment into one control", () => {
    const model = buildOpenHABSemanticModel(fixtureItems());
    const opening = model.controls.find((control) => control.controlType === "opening");

    expect(opening?.controlId).toBe("Equ_Raffstore");
    expect(opening?.itemRefs.itemNames).toEqual(["Raffstore_Left", "Raffstore_Right"]);
    expect(opening?.subtype).toBe("raffstore");
  });

  it("maps garage doors to opening controls with garagedoor subtype", () => {
    const model = buildOpenHABSemanticModel(fixtureItems());
    const garageDoor = model.controls.find(
      (control) => control.controlId === "KNX_Hormann_Garagentor"
    );

    expect(garageDoor?.controlType).toBe("opening");
    if (!garageDoor || garageDoor.controlType !== "opening") {
      throw new Error("Expected garage door opening control");
    }
    expect(garageDoor.itemRefs.itemNames).toEqual(["KNX_Hormann_Garagentor_Garagentor"]);
    expect(garageDoor.subtype).toBe("garagedoor");
  });

  it("maps EVSE equipment to evcc controls", () => {
    const model = buildOpenHABSemanticModel(fixtureItems());
    const evcc = model.controls.find((control) => control.controlId === "EVCC_Garage");

    expect(evcc?.controlType).toBe("evcc");
    if (!evcc || evcc.controlType !== "evcc") {
      throw new Error("Expected EVCC control");
    }
    expect(evcc.itemRefs).toEqual({
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
    });
  });

  it("supports raw openHAB property tags for sidebar metrics", () => {
    const [temperature, humidity, co2] = [
      "Healthy_Home_Coach_Temperature",
      "Healthy_Home_Coach_Humidity",
      "Healthy_Home_Coach_CO2",
    ].map((itemName) => fixtureItems().find((item) => item.name === itemName)!);

    expect(itemHasSemanticProperty(temperature, PROPERTY_TEMPERATURE)).toBe(true);
    expect(itemHasSemanticProperty(humidity, PROPERTY_HUMIDITY)).toBe(true);
    expect(itemHasSemanticProperty(co2, PROPERTY_CO2)).toBe(true);
  });

  it("excludes hidden locations from root and child navigation lists", () => {
    const model = buildOpenHABSemanticModel([
      ...fixtureItems(),
      createItem("Versteckt", "Group", ["LivingRoom"], ["EG"], {
        label: "Versteckt",
        metadata: {
          "dashboard-location": {
            value: "v1",
            config: { order: 5, hidden: true },
          },
        },
      }),
    ]);

    expect(model.locationsByName.has("Versteckt")).toBe(false);
    expect(model.childLocationNamesByParentName.EG).toEqual(["Wohnzimmer", "Essen"]);
    expect(model.rootLocationNames).toEqual(["Hauer"]);
  });
});
