// This file is auto-generated. Do not edit manually.
// Generated on: 2025-10-26T21:20:13.570Z
// Source: OpenHAB REST API (192.168.1.15:9443)

/**
 * OpenHAB Item Names organized by semantic types and properties
 *
 * This file contains all item names as TypeScript constants organized
 * by their semantic types and properties to provide better structure and type safety.
 * Generated from live OpenHAB REST API data.
 */

// =============================================================================
// SEMANTIC DOMAINS - Organized by OpenHAB semantic model
// =============================================================================

// Equipment domain (21 items)
export const Equipment = {
  // AudioVisual items (4 items)
  AudioVisual: {
    // Samsung TV Keller (Group)
    Samsung_TV_Keller: 'Samsung_TV_Keller',
    // Samsung TV Wohnzimmer (Group)
    Samsung_TV_Wohnzimmer: 'Samsung_TV_Wohnzimmer',
    // Spotify (Group)
    Spotify: 'Spotify',
    // TX-NR636 (Group)
    TXNR636: 'TXNR636',
  } as const,

  // Computer items (1 items)
  Computer: {
    // iPad Air (2024) Ylvie (Group)
    iPad_Air_2024_Ylvie: 'iPad_Air_2024_Ylvie',
  } as const,

  // Door items (1 items)
  Door: {
    // KNX Hörmann Garagentor (Group)
    KNX_Hormann_Garagentor: 'KNX_Hormann_Garagentor',
  } as const,

  // General items (6 items)
  General: {
    // EVCC (Group)
    EVCC: 'EVCC',
    // Go-eCharger (Group)
    GoeCharger: 'GoeCharger',
    // Healthy Home Coach (Group)
    Healthy_Home_Coach: 'Healthy_Home_Coach',
    // KOSTAL PLENTICORE Plus 10.0 (no Battery) (Group)
    KOSTAL_PLENTICORE_Plus_100_no_Battery: 'KOSTAL_PLENTICORE_Plus_100_no_Battery',
    // Shelly HT Bad (Group)
    Shelly_HT_Bad: 'Shelly_HT_Bad',
    // Shelly RGBW PM Büro Keller (Group)
    Shelly_RGBW_PM_Buro_Keller: 'Shelly_RGBW_PM_Buro_Keller',
  } as const,

  // HVAC items (1 items)
  HVAC: {
    // KNX Helios KWRL (Group)
    KNX_Helios_KWRL: 'KNX_Helios_KWRL',
  } as const,

  // PowerOutlet items (3 items)
  PowerOutlet: {
    // Shelly Plug Büro Keller (Group)
    Shelly_Plug_Buro_Keller: 'Shelly_Plug_Buro_Keller',
    // Shelly Plug Speis (Group)
    Shelly_Plug_Speis: 'Shelly_Plug_Speis',
    // Shelly Plug Wohnzimmer (Group)
    Shelly_Plug_Wohnzimmer: 'Shelly_Plug_Wohnzimmer',
  } as const,

  // Sensor items (1 items)
  Sensor: {
    // ShellyHT Wohnzimmer (Group)
    ShellyHT_Wohnzimmer: 'ShellyHT_Wohnzimmer',
  } as const,

  // Smartphone items (4 items)
  Smartphone: {
    // iPhone 12 Ylvie (Group)
    iPhone_12_Ylvie: 'iPhone_12_Ylvie',
    // iPhone 13 Nevia (Group)
    iPhone_13_Nevia: 'iPhone_13_Nevia',
    // iPhone 16 Pro Michi (Group)
    iPhone_16_Pro_Michi: 'iPhone_16_Pro_Michi',
    // Samsung Galaxy A55 Sabrina (Group)
    Samsung_Galaxy_A55_Sabrina: 'Samsung_Galaxy_A55_Sabrina',
  } as const,

} as const

// Group domain (1 items)
export const Group = {
  // General items (1 items)
  General: {
    // ⌀ Luftfeuchtigkeit EG (Group) - Current: 69.4999999999999999999999999999999930500 %
    EG_Humidities: 'EG_Humidities',
  } as const,

} as const

// Location domain (30 items)
export const Location = {
  // General items (26 items)
  General: {
    // Anschlussraum (Group)
    Anschlussraum: 'Anschlussraum',
    // Bad (Group)
    Bad: 'Bad',
    // Büro (Group)
    Buero: 'Buero',
    // Büro (Group)
    BueroEG: 'BueroEG',
    // Group
    Einfahrt: 'Einfahrt',
    // Essen (Group)
    Essen: 'Essen',
    // Esstisch (Group)
    Esstisch: 'Esstisch',
    // Group
    Fitnessraum: 'Fitnessraum',
    // Gang (Group)
    Gang: 'Gang',
    // Group
    Garage: 'Garage',
    // Brunnengasse 19, 7341 Lindgraben (Group)
    Hauer: 'Hauer',
    // Zimmer Nevia (Group)
    Nevia: 'Nevia',
    // Zimmer Sabrina & Michi (Group)
    SabrinaMichi: 'SabrinaMichi',
    // Group
    Schleuse: 'Schleuse',
    // Group
    Schrankraum: 'Schrankraum',
    // Group
    Serverraum: 'Serverraum',
    // Shelly Color Bulbs HSB (Color) - Current: 0,0,0
    Shelly_Color_Bulbs_Esstisch: 'Shelly_Color_Bulbs_Esstisch',
    // Shelly Color Bulbs Farbwahl (String) - Current: white
    Shelly_Color_Bulbs_Esstisch_White: 'Shelly_Color_Bulbs_Esstisch_White',
    // Speis (Group)
    Speis: 'Speis',
    // Group
    Technikraum: 'Technikraum',
    // Group
    Terrasse: 'Terrasse',
    // Group
    Waschraum: 'Waschraum',
    // WC (Group)
    WC: 'WC',
    // WC Keller (Group)
    WCKeller: 'WCKeller',
    // Wohnzimmer (Group)
    Wohnzimmer: 'Wohnzimmer',
    // Zimmer Ylvie (Group)
    Ylvie: 'Ylvie',
  } as const,

  // Indoor items (4 items)
  Indoor: {
    // Erdgeschoss (Group)
    EG: 'EG',
    // Keller (Group)
    Keller: 'Keller',
    // Küche (Group)
    Kueche: 'Kueche',
    // Vorraum & Garderobe (Group)
    Vorraum: 'Vorraum',
  } as const,

} as const

// Point domain (309 items)
export const Point = {
  // Control items (56 items)
  Control: {
    // Charging max Current (Number:ElectricCurrent) - Current: 16 A
    EVCC_Charging_max_Current: 'EVCC_Charging_max_Current',
    // Charging min Current (Number:ElectricCurrent) - Current: 6 A
    EVCC_Charging_min_Current: 'EVCC_Charging_min_Current',
    // Current Session Charge Energy Limit (Number:Energy) - Current: UNDEF
    GoeCharger_Current_Session_Charge_Energy_Limit: 'GoeCharger_Current_Session_Charge_Energy_Limit',
    // Maximum Current (Number:ElectricCurrent) - Current: 16 A
    GoeCharger_Maximum_Current: 'GoeCharger_Maximum_Current',
    // Maximum Current Temporary (Number:ElectricCurrent) - Current: UNDEF
    GoeCharger_Maximum_Current_Temporary: 'GoeCharger_Maximum_Current_Temporary',
    // Multimedia (Switch) - Current: OFF
    KNX_2fach_Taster_Buro_Keller_Stiege_Multimedia: 'KNX_2fach_Taster_Buro_Keller_Stiege_Multimedia',
    // Garagentor (Rollershutter) - Current: 100
    KNX_Hormann_Garagentor_Garagentor: 'KNX_Hormann_Garagentor_Garagentor',
    // Raffstore Esstisch (Rollershutter) - Current: 100
    KNX_JA1_Raffstore_Esstisch: 'KNX_JA1_Raffstore_Esstisch',
    // Raffstore Wohnzimmer (Rollershutter) - Current: 100
    KNX_JA1_Raffstore_Wohnzimmer: 'KNX_JA1_Raffstore_Wohnzimmer',
    // Raffstore Wohnzimmer Straße (Rollershutter) - Current: 100
    KNX_JA1_Raffstore_Wohnzimmer_Strasse: 'KNX_JA1_Raffstore_Wohnzimmer_Strasse',
    // Rollladen Michi & Sabrina (Rollershutter) - Current: 100
    KNX_JA2_Rollladen_Michi__Sabrina: 'KNX_JA2_Rollladen_Michi__Sabrina',
    // Rollladen Nevia (Rollershutter) - Current: 100.0
    KNX_JA2_Rollladen_Nevia: 'KNX_JA2_Rollladen_Nevia',
    // Rollladen Schrankraum (Rollershutter) - Current: 100
    KNX_JA2_Rollladen_Schrankraum: 'KNX_JA2_Rollladen_Schrankraum',
    // Rollladen Ylvie (Rollershutter) - Current: 100.0
    KNX_JA2_Rollladen_Ylvie: 'KNX_JA2_Rollladen_Ylvie',
    // Rollladen Gang (Rollershutter) - Current: 100
    KNX_RA1_CH01: 'KNX_RA1_CH01',
    // Rollladen Gang (Rollershutter) - Current: 100
    KNX_RA1_CH04: 'KNX_RA1_CH04',
    // Markise Terrasse (Rollershutter) - Current: 0.0
    KNX_RA1_Markise_Terrasse: 'KNX_RA1_Markise_Terrasse',
    // Rollladen Büro (Rollershutter) - Current: 100
    KNX_RA1_Rollladen_Buro: 'KNX_RA1_Rollladen_Buro',
    // Licht Büro (Switch) - Current: OFF
    KNX_SAH1_Stromerkennung_Licht_Buro: 'KNX_SAH1_Stromerkennung_Licht_Buro',
    // Licht Nevia (Switch) - Current: OFF
    KNX_SAH1_Stromerkennung_Licht_Nevia: 'KNX_SAH1_Stromerkennung_Licht_Nevia',
    // Licht Schlafzimmer (Switch) - Current: OFF
    KNX_SAH1_Stromerkennung_Licht_Schlafzimmer: 'KNX_SAH1_Stromerkennung_Licht_Schlafzimmer',
    // Licht Schrankraum (Switch) - Current: OFF
    KNX_SAH1_Stromerkennung_Licht_Schrankraum: 'KNX_SAH1_Stromerkennung_Licht_Schrankraum',
    // Licht Ylvie (Switch) - Current: OFF
    KNX_SAH1_Stromerkennung_Licht_Ylvie: 'KNX_SAH1_Stromerkennung_Licht_Ylvie',
    // Licht Einfahrt (Switch) - Current: OFF
    KNX_SAH2_Licht_Einfahrt: 'KNX_SAH2_Licht_Einfahrt',
    // Licht Eingang (Switch) - Current: OFF
    KNX_SAH2_Licht_Eingang: 'KNX_SAH2_Licht_Eingang',
    // Licht Garage (Switch) - Current: OFF
    KNX_SAH2_Licht_Garage: 'KNX_SAH2_Licht_Garage',
    // Licht Keller Anschlussraum (Switch) - Current: OFF
    KNX_SAH2_Licht_Keller_Anschlussraum: 'KNX_SAH2_Licht_Keller_Anschlussraum',
    // Licht Keller Gang (Switch) - Current: OFF
    KNX_SAH2_Licht_Keller_Gang: 'KNX_SAH2_Licht_Keller_Gang',
    // Licht Terrasse Säulen (Switch) - Current: OFF
    KNX_SAH2_Licht_Terrasse_Saulen: 'KNX_SAH2_Licht_Terrasse_Saulen',
    // Licht Terrasse Wand (Switch) - Current: OFF
    KNX_SAH2_Licht_Terrasse_Wand: 'KNX_SAH2_Licht_Terrasse_Wand',
    // Licht WC Keller (Switch) - Current: OFF
    KNX_SAH2_Licht_WC_Keller: 'KNX_SAH2_Licht_WC_Keller',
    // Licht Bad Dusche (Switch) - Current: OFF
    KNX_SAH3_Licht_Bad_Dusche: 'KNX_SAH3_Licht_Bad_Dusche',
    // Licht Bad Spiegel (Switch) - Current: OFF
    KNX_SAH3_Licht_Bad_Spiegel: 'KNX_SAH3_Licht_Bad_Spiegel',
    // Licht Fitness (Switch) - Current: OFF
    KNX_SAH3_Licht_Fitness: 'KNX_SAH3_Licht_Fitness',
    // Licht Schleuse (Switch) - Current: ON
    KNX_SAH3_Licht_Schleuse: 'KNX_SAH3_Licht_Schleuse',
    // Licht Serverraum (Switch) - Current: OFF
    KNX_SAH3_Licht_Serverraum: 'KNX_SAH3_Licht_Serverraum',
    // Licht Technikraum (Switch) - Current: OFF
    KNX_SAH3_Licht_Technikraum: 'KNX_SAH3_Licht_Technikraum',
    // KNX Status Spät (Switch) - Current: ON
    KNX_State_Flag_Item_Late: 'KNX_State_Flag_Item_Late',
    // Status Nacht (Switch) - Current: ON
    KNX_Status_Flags_KNX_Status_Nacht: 'KNX_Status_Flags_KNX_Status_Nacht',
    // Licht Esstisch (Switch) - Current: OFF
    SAH1_Stromerkennung_Licht_Esstisch: 'SAH1_Stromerkennung_Licht_Esstisch',
    // Licht Speis (Switch) - Current: OFF
    SAH1_Stromerkennung_Licht_Speis: 'SAH1_Stromerkennung_Licht_Speis',
    // Licht Keller Büro (Switch) - Current: ON
    SAH2_Licht_Keller_Buro: 'SAH2_Licht_Keller_Buro',
    // Licht Couch (Switch) - Current: OFF
    SAH3_Licht_Couch: 'SAH3_Licht_Couch',
    // Licht TV (Switch) - Current: OFF
    SAH3_Licht_TV: 'SAH3_Licht_TV',
    // Licht Küche (Switch) - Current: OFF
    SHA1_Stromerkennung_Licht_Kuche: 'SHA1_Stromerkennung_Licht_Kuche',
    // Betrieb (Switch) - Current: ON
    Shelly_Plug_Buro_Keller_Betrieb: 'Shelly_Plug_Buro_Keller_Betrieb',
    // Betrieb (Switch) - Current: ON
    Shelly_Plug_Speis_Betrieb: 'Shelly_Plug_Speis_Betrieb',
    // Betrieb (Switch) - Current: ON
    Shelly_Plug_Wohnzimmer_Betrieb: 'Shelly_Plug_Wohnzimmer_Betrieb',
    // Farbe (Color) - Current: 0,0,0
    Shelly_RGBW_PM_Buro_Keller_Farbe: 'Shelly_RGBW_PM_Buro_Keller_Farbe',
    // Active Device Name (String) - Current: macbook
    Spotify_Active_Device_Name: 'Spotify_Active_Device_Name',
    // Active Device Shuffle (Switch) - Current: ON
    Spotify_Active_Device_Shuffle: 'Spotify_Active_Device_Shuffle',
    // Active Devices (String) - Current: fdc36347119a7c81135630e0ae3d0499882fd6b2
    Spotify_Active_Devices: 'Spotify_Active_Devices',
    // Fernbedienung (Player) - Current: PLAY
    Spotify_Fernbedienung: 'Spotify_Fernbedienung',
    // Lautstärke (Dimmer) - Current: 100
    Spotify_Lautstarke: 'Spotify_Lautstarke',
    // Playlists (String) - Current: spotify:playlist:06OZBLcSEJiRyBXqiW4pm3
    Spotify_Playlists: 'Spotify_Playlists',
    // Repeat Mode (String) - Current: off
    Spotify_Repeat_Mode: 'Spotify_Repeat_Mode',
  } as const,

  // General items (148 items)
  General: {
    // Available Version (String) - Current: 0.207.1
    EVCC_Available_Version: 'EVCC_Available_Version',
    // Charger Feature: Heating (Switch) - Current: OFF
    EVCC_Charger_Feature_Heating: 'EVCC_Charger_Feature_Heating',
    // Charger Feature: Integrated Device (Switch) - Current: OFF
    EVCC_Charger_Feature_Integrated_Device: 'EVCC_Charger_Feature_Integrated_Device',
    // Charging Active Phases (Number) - Current: 3.0
    EVCC_Charging_Active_Phases: 'EVCC_Charging_Active_Phases',
    // Charging Duration (Number:Time) - Current: 33789.99999999999 s
    EVCC_Charging_Duration: 'EVCC_Charging_Duration',
    // Charging Enabled (Switch) - Current: ON
    EVCC_Charging_Enabled: 'EVCC_Charging_Enabled',
    // Charging Enabled Phases (Number) - Current: 0.0
    EVCC_Charging_Enabled_Phases: 'EVCC_Charging_Enabled_Phases',
    // Charging Limit Energy (Number:Energy) - Current: 0 kWh
    EVCC_Charging_Limit_Energy: 'EVCC_Charging_Limit_Energy',
    // Charging Limit SoC (Number:Dimensionless) - Current: 0 %
    EVCC_Charging_Limit_SoC: 'EVCC_Charging_Limit_SoC',
    // Charging Mode (String) - Current: now
    EVCC_Charging_Mode: 'EVCC_Charging_Mode',
    // Charging Remaining Duration (Number:Time) - Current: 0 s
    EVCC_Charging_Remaining_Duration: 'EVCC_Charging_Remaining_Duration',
    // Effective Charging Limit (Number:Dimensionless) - Current: 100 %
    EVCC_Effective_Charging_Limit: 'EVCC_Effective_Charging_Limit',
    // Loadpoint Title (String) - Current: Garage
    EVCC_Loadpoint_Title: 'EVCC_Loadpoint_Title',
    // Vehicle Charging Limit SoC (Number:Dimensionless) - Current: 0 %
    EVCC_Vehicle_Charging_Limit_SoC: 'EVCC_Vehicle_Charging_Limit_SoC',
    // Vehicle Connected Duration (Number:Time) - Current: 0 s
    EVCC_Vehicle_Connected_Duration: 'EVCC_Vehicle_Connected_Duration',
    // Vehicle Data Access (Switch) - Current: OFF
    EVCC_Vehicle_Data_Access: 'EVCC_Vehicle_Data_Access',
    // Vehicle Min SoC (Number:Dimensionless) - Current: 0 %
    EVCC_Vehicle_Min_SoC: 'EVCC_Vehicle_Min_SoC',
    // Vehicle Name (String) - Current: db-5
    EVCC_Vehicle_Name: 'EVCC_Vehicle_Name',
    // Vehicle Odometer (Number:Length) - Current: 0 m
    EVCC_Vehicle_Odometer: 'EVCC_Vehicle_Odometer',
    // Vehicle Plan Enabled (Switch) - Current: OFF
    EVCC_Vehicle_Plan_Enabled: 'EVCC_Vehicle_Plan_Enabled',
    // Vehicle Plan SoC (Number:Dimensionless) - Current: 100 %
    EVCC_Vehicle_Plan_SoC: 'EVCC_Vehicle_Plan_SoC',
    // Vehicle Plan Time (DateTime) - Current: 2025-08-02T04:10:47.155+0200
    EVCC_Vehicle_Plan_Time: 'EVCC_Vehicle_Plan_Time',
    // Vehicle Range (Number:Length) - Current: 0 m
    EVCC_Vehicle_Range: 'EVCC_Vehicle_Range',
    // Vehicle SoC (Number:Dimensionless) - Current: 0 %
    EVCC_Vehicle_SoC: 'EVCC_Vehicle_SoC',
    // Vehicle Title (String) - Current: EV6
    EVCC_Vehicle_Title: 'EVCC_Vehicle_Title',
    // Version (String) - Current: 0.205.0
    EVCC_Version: 'EVCC_Version',
    // Access Configuration (String) - Current: UNDEF
    GoeCharger_Access_Configuration: 'GoeCharger_Access_Configuration',
    // Allow Charging (Switch) - Current: ON
    GoeCharger_Allow_Charging: 'GoeCharger_Allow_Charging',
    // Awatttar Max Price (Number) - Current: 3.0
    GoeCharger_Awatttar_Max_Price: 'GoeCharger_Awatttar_Max_Price',
    // Cable Encoding (Number:ElectricCurrent) - Current: 32 A
    GoeCharger_Cable_Encoding: 'GoeCharger_Cable_Encoding',
    // Error Code (String) - Current: IDLE
    GoeCharger_Error_Code: 'GoeCharger_Error_Code',
    // Firmware (String) - Current: 57.1
    GoeCharger_Firmware: 'GoeCharger_Firmware',
    // Force state (Number) - Current: 2
    GoeCharger_Force_state: 'GoeCharger_Force_state',
    // Phases (Number) - Current: 3
    GoeCharger_Phases: 'GoeCharger_Phases',
    // PWM signal status (String) - Current: CHARGING
    GoeCharger_PWM_signal_status: 'GoeCharger_PWM_signal_status',
    // Transaction (Number) - Current: UNDEF
    GoeCharger_Transaction: 'GoeCharger_Transaction',
    // Access-Point (String) - Current: UNDEF
    iPad_Air_2024_Ylvie_AccessPoint: 'iPad_Air_2024_Ylvie_AccessPoint',
    // Drahtloses Netzwerk (String) - Current: UNDEF
    iPad_Air_2024_Ylvie_Drahtloses_Netzwerk: 'iPad_Air_2024_Ylvie_Drahtloses_Netzwerk',
    // Experience (Number:Dimensionless) - Current: 0 %
    iPad_Air_2024_Ylvie_Experience: 'iPad_Air_2024_Ylvie_Experience',
    // Hostname (String) - Current: iPad
    iPad_Air_2024_Ylvie_Hostname: 'iPad_Air_2024_Ylvie_Hostname',
    // IP Addresse (String) - Current: UNDEF
    iPad_Air_2024_Ylvie_IP_Addresse: 'iPad_Air_2024_Ylvie_IP_Addresse',
    // MAC Adresse (String) - Current: 06:da:aa:f6:f8:e0
    iPad_Air_2024_Ylvie_MAC_Adresse: 'iPad_Air_2024_Ylvie_MAC_Adresse',
    // Name (String)
    iPad_Air_2024_Ylvie_Name: 'iPad_Air_2024_Ylvie_Name',
    // Online (Switch) - Current: OFF
    iPad_Air_2024_Ylvie_Online: 'iPad_Air_2024_Ylvie_Online',
    // Online seit (Number:Time) - Current: 0 s
    iPad_Air_2024_Ylvie_Online_seit: 'iPad_Air_2024_Ylvie_Online_seit',
    // Zuletzt gesehen (DateTime) - Current: 2025-10-26T18:54:06.000+0100
    iPad_Air_2024_Ylvie_Zuletzt_gesehen: 'iPad_Air_2024_Ylvie_Zuletzt_gesehen',
    // Access-Point (String) - Current: UNDEF
    iPhone_12_Ylvie_AccessPoint: 'iPhone_12_Ylvie_AccessPoint',
    // Drahtloses Netzwerk (String) - Current: UNDEF
    iPhone_12_Ylvie_Drahtloses_Netzwerk: 'iPhone_12_Ylvie_Drahtloses_Netzwerk',
    // Experience (Number:Dimensionless) - Current: 0 %
    iPhone_12_Ylvie_Experience: 'iPhone_12_Ylvie_Experience',
    // Hostname (String) - Current: iPhone
    iPhone_12_Ylvie_Hostname: 'iPhone_12_Ylvie_Hostname',
    // IP Addresse (String) - Current: UNDEF
    iPhone_12_Ylvie_IP_Addresse: 'iPhone_12_Ylvie_IP_Addresse',
    // MAC Adresse (String) - Current: 6e:c4:2f:53:bc:a9
    iPhone_12_Ylvie_MAC_Adresse: 'iPhone_12_Ylvie_MAC_Adresse',
    // Online (Switch) - Current: OFF
    iPhone_12_Ylvie_Online: 'iPhone_12_Ylvie_Online',
    // Online seit (Number:Time) - Current: 0 s
    iPhone_12_Ylvie_Online_seit: 'iPhone_12_Ylvie_Online_seit',
    // Zuletzt gesehen (DateTime) - Current: 2025-10-26T18:54:06.000+0100
    iPhone_12_Ylvie_Zuletzt_gesehen: 'iPhone_12_Ylvie_Zuletzt_gesehen',
    // Access-Point (String) - Current: UNDEF
    iPhone_13_Nevia_AccessPoint: 'iPhone_13_Nevia_AccessPoint',
    // Drahtloses Netzwerk (String) - Current: UNDEF
    iPhone_13_Nevia_Drahtloses_Netzwerk: 'iPhone_13_Nevia_Drahtloses_Netzwerk',
    // Experience (Number:Dimensionless) - Current: 0 %
    iPhone_13_Nevia_Experience: 'iPhone_13_Nevia_Experience',
    // Hostname (String) - Current: iPhone
    iPhone_13_Nevia_Hostname: 'iPhone_13_Nevia_Hostname',
    // IP Addresse (String) - Current: UNDEF
    iPhone_13_Nevia_IP_Addresse: 'iPhone_13_Nevia_IP_Addresse',
    // MAC Adresse (String) - Current: 4a:d0:1c:4c:88:08
    iPhone_13_Nevia_MAC_Adresse: 'iPhone_13_Nevia_MAC_Adresse',
    // Name (String)
    iPhone_13_Nevia_Name: 'iPhone_13_Nevia_Name',
    // Online (Switch) - Current: OFF
    iPhone_13_Nevia_Online: 'iPhone_13_Nevia_Online',
    // Online seit (Number:Time) - Current: 0 s
    iPhone_13_Nevia_Online_seit: 'iPhone_13_Nevia_Online_seit',
    // Zuletzt gesehen (DateTime) - Current: 2025-10-26T19:11:17.000+0100
    iPhone_13_Nevia_Zuletzt_gesehen: 'iPhone_13_Nevia_Zuletzt_gesehen',
    // Access-Point (String) - Current: UK Ultra
    iPhone_16_Pro_Michi_AccessPoint: 'iPhone_16_Pro_Michi_AccessPoint',
    // Drahtloses Netzwerk (String) - Current: HauerWLAN
    iPhone_16_Pro_Michi_Drahtloses_Netzwerk: 'iPhone_16_Pro_Michi_Drahtloses_Netzwerk',
    // Experience (Number:Dimensionless) - Current: 100 %
    iPhone_16_Pro_Michi_Experience: 'iPhone_16_Pro_Michi_Experience',
    // Hostname (String) - Current: iPhone
    iPhone_16_Pro_Michi_Hostname: 'iPhone_16_Pro_Michi_Hostname',
    // IP Addresse (String) - Current: 192.168.1.67
    iPhone_16_Pro_Michi_IP_Addresse: 'iPhone_16_Pro_Michi_IP_Addresse',
    // MAC Adresse (String) - Current: 82:a0:8b:f3:b5:9f
    iPhone_16_Pro_Michi_MAC_Adresse: 'iPhone_16_Pro_Michi_MAC_Adresse',
    // Name (String)
    iPhone_16_Pro_Michi_Name: 'iPhone_16_Pro_Michi_Name',
    // Online (Switch) - Current: ON
    iPhone_16_Pro_Michi_Online: 'iPhone_16_Pro_Michi_Online',
    // Online seit (Number:Time) - Current: 6187 s
    iPhone_16_Pro_Michi_Online_seit: 'iPhone_16_Pro_Michi_Online_seit',
    // Zuletzt gesehen (DateTime) - Current: 2025-10-26T22:20:07.000+0100
    iPhone_16_Pro_Michi_Zuletzt_gesehen: 'iPhone_16_Pro_Michi_Zuletzt_gesehen',
    // Restlaufzeit Filter (Number:Time) - Current: 0 s
    KNX_Helios_KWRL_Restlaufzeit_Filter: 'KNX_Helios_KWRL_Restlaufzeit_Filter',
    // Status Tor geschlossen (Switch) - Current: ON
    KNX_Hormann_Garagentor_Status_Tor_geschlossen: 'KNX_Hormann_Garagentor_Status_Tor_geschlossen',
    // Status Tor offen (Switch) - Current: OFF
    KNX_Hormann_Garagentor_Status_Tor_offen: 'KNX_Hormann_Garagentor_Status_Tor_offen',
    // Licht Waschraum (Switch) - Current: OFF
    KNX_SAH3_Licht_Waschraum: 'KNX_SAH3_Licht_Waschraum',
    // Dämmerschwelle überschritten (Number) - Current: 0.0
    KNX_Wetterstation_Dammerschwelle_uberschritten: 'KNX_Wetterstation_Dammerschwelle_uberschritten',
    // Regen (Number) - Current: 0
    KNX_Wetterstation_Regen: 'KNX_Wetterstation_Regen',
    // AC Frequency (Number:Frequency) - Current: 50.0335693359 Hz
    KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Frequency: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Frequency',
    // CO2 Savings Day (Number:Mass) - Current: 10.3020762750022 kg
    KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Day: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Day',
    // CO2 Savings Month (Number:Mass) - Current: 340.38578912823726 kg
    KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Month: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Month',
    // CO2 Savings Total (Number:Mass) - Current: 21621.54864424143 kg
    KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Total: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Total',
    // CO2 Savings Year (Number:Mass) - Current: 6820.187239101202 kg
    KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Year: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Year',
    // Cos Phi (Number:Dimensionless) - Current: 1 %
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Cos_Phi: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Cos_Phi',
    // Feed-in Limit (Number:Power) - Current: 10049.9990234375 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit',
    // Feed-in Limit Relative (Number:Dimensionless) - Current: 100 %
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit_Relative: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit_Relative',
    // MC Errors (Number:Dimensionless) - Current: 0 %
    KOSTAL_PLENTICORE_Plus_100_no_Battery_MC_Errors: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_MC_Errors',
    // SCB Errors (Number:Dimensionless) - Current: 0 %
    KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Errors: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Errors',
    // SCB Warnings (Number:Dimensionless) - Current: 0 %
    KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Warnings: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Warnings',
    // SFH Errors (Number:Dimensionless) - Current: 0 %
    KOSTAL_PLENTICORE_Plus_100_no_Battery_SFH_Errors: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SFH_Errors',
    // Uptime (Number:Time) - Current: 48550511 s
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Uptime: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Uptime',
    // Access-Point (String) - Current: FlexHD
    Samsung_Galaxy_A55_Sabrina_AccessPoint: 'Samsung_Galaxy_A55_Sabrina_AccessPoint',
    // Drahtloses Netzwerk (String) - Current: HauerWLAN
    Samsung_Galaxy_A55_Sabrina_Drahtloses_Netzwerk: 'Samsung_Galaxy_A55_Sabrina_Drahtloses_Netzwerk',
    // Experience (Number:Dimensionless) - Current: 97 %
    Samsung_Galaxy_A55_Sabrina_Experience: 'Samsung_Galaxy_A55_Sabrina_Experience',
    // Hostname (String) - Current: A55-von-Sabrina
    Samsung_Galaxy_A55_Sabrina_Hostname: 'Samsung_Galaxy_A55_Sabrina_Hostname',
    // IP Addresse (String) - Current: 192.168.1.103
    Samsung_Galaxy_A55_Sabrina_IP_Addresse: 'Samsung_Galaxy_A55_Sabrina_IP_Addresse',
    // MAC Adresse (String) - Current: 3e:a8:93:4d:a7:8e
    Samsung_Galaxy_A55_Sabrina_MAC_Adresse: 'Samsung_Galaxy_A55_Sabrina_MAC_Adresse',
    // Name (String)
    Samsung_Galaxy_A55_Sabrina_Name: 'Samsung_Galaxy_A55_Sabrina_Name',
    // Online (Switch) - Current: ON
    Samsung_Galaxy_A55_Sabrina_Online: 'Samsung_Galaxy_A55_Sabrina_Online',
    // Online seit (Number:Time) - Current: 19064 s
    Samsung_Galaxy_A55_Sabrina_Online_seit: 'Samsung_Galaxy_A55_Sabrina_Online_seit',
    // Zuletzt gesehen (DateTime) - Current: 2025-10-26T22:20:06.000+0100
    Samsung_Galaxy_A55_Sabrina_Zuletzt_gesehen: 'Samsung_Galaxy_A55_Sabrina_Zuletzt_gesehen',
    // Art Mode (Switch) - Current: OFF
    Samsung_TV_Keller_Art_Mode: 'Samsung_TV_Keller_Art_Mode',
    // Artwork Orientation (Switch) - Current: OFF
    Samsung_TV_Keller_Artwork_Orientation: 'Samsung_TV_Keller_Artwork_Orientation',
    // Kanal (String)
    Samsung_TV_Keller_Kanal: 'Samsung_TV_Keller_Kanal',
    // Kanalnummer (Number)
    Samsung_TV_Keller_Kanalnummer: 'Samsung_TV_Keller_Kanalnummer',
    // Lautstärke (Dimmer) - Current: 0.0
    Samsung_TV_Keller_Lautstarke: 'Samsung_TV_Keller_Lautstarke',
    // Power (Switch) - Current: OFF
    Samsung_TV_Keller_Power: 'Samsung_TV_Keller_Power',
    // Source (String)
    Samsung_TV_Keller_Source: 'Samsung_TV_Keller_Source',
    // Stumm schalten (Switch) - Current: OFF
    Samsung_TV_Keller_Stumm_schalten: 'Samsung_TV_Keller_Stumm_schalten',
    // Tastendruck (String)
    Samsung_TV_Keller_Tastendruck: 'Samsung_TV_Keller_Tastendruck',
    // Titel (String)
    Samsung_TV_Keller_Titel: 'Samsung_TV_Keller_Titel',
    // Art Mode (Switch) - Current: OFF
    Samsung_TV_Wohnzimmer_Art_Mode: 'Samsung_TV_Wohnzimmer_Art_Mode',
    // Artwork Orientation (Switch)
    Samsung_TV_Wohnzimmer_Artwork_Orientation: 'Samsung_TV_Wohnzimmer_Artwork_Orientation',
    // Kanal (String)
    Samsung_TV_Wohnzimmer_Kanal: 'Samsung_TV_Wohnzimmer_Kanal',
    // Kanalnummer (Number)
    Samsung_TV_Wohnzimmer_Kanalnummer: 'Samsung_TV_Wohnzimmer_Kanalnummer',
    // Lautstärke (Dimmer) - Current: 53
    Samsung_TV_Wohnzimmer_Lautstarke: 'Samsung_TV_Wohnzimmer_Lautstarke',
    // Power (Switch) - Current: OFF
    Samsung_TV_Wohnzimmer_Power: 'Samsung_TV_Wohnzimmer_Power',
    // Source (String)
    Samsung_TV_Wohnzimmer_Source: 'Samsung_TV_Wohnzimmer_Source',
    // Stumm schalten (Switch) - Current: OFF
    Samsung_TV_Wohnzimmer_Stumm_schalten: 'Samsung_TV_Wohnzimmer_Stumm_schalten',
    // Tastendruck (String)
    Samsung_TV_Wohnzimmer_Tastendruck: 'Samsung_TV_Wohnzimmer_Tastendruck',
    // Titel (String)
    Samsung_TV_Wohnzimmer_Titel: 'Samsung_TV_Wohnzimmer_Titel',
    // Letzter Fehler (String) - Current: 
    Shelly_HT_Bad_Letzter_Fehler: 'Shelly_HT_Bad_Letzter_Fehler',
    // Betriebs-LED aus (Switch) - Current: OFF
    Shelly_Plug_Buro_Keller_BetriebsLED_aus: 'Shelly_Plug_Buro_Keller_BetriebsLED_aus',
    // Status-LED aus (Switch) - Current: ON
    Shelly_Plug_Buro_Keller_StatusLED_aus: 'Shelly_Plug_Buro_Keller_StatusLED_aus',
    // Betriebs-LED aus (Switch) - Current: OFF
    Shelly_Plug_Speis_BetriebsLED_aus: 'Shelly_Plug_Speis_BetriebsLED_aus',
    // Status-LED aus (Switch) - Current: OFF
    Shelly_Plug_Speis_StatusLED_aus: 'Shelly_Plug_Speis_StatusLED_aus',
    // Status-LED aus (Switch) - Current: OFF
    Shelly_Plug_Wohnzimmer_StatusLED_aus: 'Shelly_Plug_Wohnzimmer_StatusLED_aus',
    // Auto-AN-Timer (Number:Time)
    Shelly_RGBW_PM_Buro_Keller_AutoANTimer: 'Shelly_RGBW_PM_Buro_Keller_AutoANTimer',
    // Auto-AUS Timer (Number:Time)
    Shelly_RGBW_PM_Buro_Keller_AutoAUS_Timer: 'Shelly_RGBW_PM_Buro_Keller_AutoAUS_Timer',
    // Blau (Dimmer) - Current: 0
    Shelly_RGBW_PM_Buro_Keller_Blau: 'Shelly_RGBW_PM_Buro_Keller_Blau',
    // Firmwareaktualisierung verfügbar (Switch) - Current: ON
    Shelly_RGBW_PM_Buro_Keller_Firmwareaktualisierung_verfugbar: 'Shelly_RGBW_PM_Buro_Keller_Firmwareaktualisierung_verfugbar',
    // Grün (Dimmer) - Current: 0
    Shelly_RGBW_PM_Buro_Keller_Grun: 'Shelly_RGBW_PM_Buro_Keller_Grun',
    // Helligkeit (Dimmer) - Current: 0.0
    Shelly_RGBW_PM_Buro_Keller_Helligkeit: 'Shelly_RGBW_PM_Buro_Keller_Helligkeit',
    // Laufzeit (Number) - Current: 1852229
    Shelly_RGBW_PM_Buro_Keller_Laufzeit: 'Shelly_RGBW_PM_Buro_Keller_Laufzeit',
    // Letzte Aktivität (DateTime) - Current: 2025-10-26T22:20:12.000+0100
    Shelly_RGBW_PM_Buro_Keller_Letzte_Aktivitat: 'Shelly_RGBW_PM_Buro_Keller_Letzte_Aktivitat',
    // Rot (Dimmer) - Current: 0
    Shelly_RGBW_PM_Buro_Keller_Rot: 'Shelly_RGBW_PM_Buro_Keller_Rot',
    // Volltonfarbe (String) - Current: green
    Shelly_RGBW_PM_Buro_Keller_Volltonfarbe: 'Shelly_RGBW_PM_Buro_Keller_Volltonfarbe',
    // Weiß (Dimmer) - Current: 0
    Shelly_RGBW_PM_Buro_Keller_Weiss: 'Shelly_RGBW_PM_Buro_Keller_Weiss',
    // Letzter Fehler (String) - Current: 
    ShellyHT_Wohnzimmer_Letzter_Fehler: 'ShellyHT_Wohnzimmer_Letzter_Fehler',
    // Album Name (String) - Current: Viva los Tioz
    Spotify_Album_Name: 'Spotify_Album_Name',
    // Playlist Name (String) - Current: MichiMix
    Spotify_Playlist_Name: 'Spotify_Playlist_Name',
    // Eingabequelle (Number) - Current: 35
    TXNR636_Zone1_Input: 'TXNR636_Zone1_Input',
    // Stumm schalten (Switch) - Current: OFF
    TXNR636_Zone1_Mute: 'TXNR636_Zone1_Mute',
    // Betrieb (Switch) - Current: OFF
    TXNR636_Zone1_Power: 'TXNR636_Zone1_Power',
    // Lautstärke (Dimmer) - Current: 32
    TXNR636_Zone1_Volume: 'TXNR636_Zone1_Volume',
  } as const,

  // Measurement items (81 items)
  Measurement: {
    // ⌀ Temperatur EG (Group) - Current: 23.09999999999999999999999999999997 °C
    EG_Temperatures: 'EG_Temperatures',
    // Charged Energy (Number:Energy) - Current: 33.364 kWh
    EVCC_Charged_Energy: 'EVCC_Charged_Energy',
    // Charging Current (Number:ElectricCurrent) - Current: 0 A
    EVCC_Charging_Current: 'EVCC_Charging_Current',
    // Charging Power (Number:Power) - Current: 410 W
    EVCC_Charging_Power: 'EVCC_Charging_Power',
    // Charging Remaining Energy (Number:Energy) - Current: 0 kWh
    EVCC_Charging_Remaining_Energy: 'EVCC_Charging_Remaining_Energy',
    // Grid Power (Number:Power) - Current: -4490.6 W
    EVCC_Grid_Power: 'EVCC_Grid_Power',
    // Home Power (Number:Power) - Current: 1845.4 W
    EVCC_Home_Power: 'EVCC_Home_Power',
    // PV Power (Number:Power) - Current: 6746 W
    EVCC_PV_Power: 'EVCC_PV_Power',
    // Vehicle Capacity (Number:Energy) - Current: 77.4 kWh
    EVCC_Vehicle_Capacity: 'EVCC_Vehicle_Capacity',
    // Current L1 (Number:ElectricCurrent) - Current: 15.19999981 A
    GoeCharger_Current_L1: 'GoeCharger_Current_L1',
    // Current L2 (Number:ElectricCurrent) - Current: 15.30000019 A
    GoeCharger_Current_L2: 'GoeCharger_Current_L2',
    // Current L3 (Number:ElectricCurrent) - Current: 15.10000038 A
    GoeCharger_Current_L3: 'GoeCharger_Current_L3',
    // Current Session Charged Energy (Number:Energy) - Current: 54.3594727 kWh
    GoeCharger_Current_Session_Charged_Energy: 'GoeCharger_Current_Session_Charged_Energy',
    // Power All (Number:Power) - Current: 10640 W
    GoeCharger_Power_All: 'GoeCharger_Power_All',
    // Power L1 (Number:Power) - Current: 3500 W
    GoeCharger_Power_L1: 'GoeCharger_Power_L1',
    // Power L2 (Number:Power) - Current: 3500 W
    GoeCharger_Power_L2: 'GoeCharger_Power_L2',
    // Power L3 (Number:Power) - Current: 3500 W
    GoeCharger_Power_L3: 'GoeCharger_Power_L3',
    // Temperature circuit board (Number:Temperature) - Current: 39 °C
    GoeCharger_Temperature_circuit_board: 'GoeCharger_Temperature_circuit_board',
    // Temperature type 2 port (Number:Temperature) - Current: 40.375 °C
    GoeCharger_Temperature_type_2_port: 'GoeCharger_Temperature_type_2_port',
    // Total Charged Energy (Number:Energy) - Current: 26070.75 kWh
    GoeCharger_Total_Charged_Energy: 'GoeCharger_Total_Charged_Energy',
    // Voltage L1 (Number:ElectricPotential) - Current: 225 V
    GoeCharger_Voltage_L1: 'GoeCharger_Voltage_L1',
    // Voltage L2 (Number:ElectricPotential) - Current: 228 V
    GoeCharger_Voltage_L2: 'GoeCharger_Voltage_L2',
    // Voltage L3 (Number:ElectricPotential) - Current: 231 V
    GoeCharger_Voltage_L3: 'GoeCharger_Voltage_L3',
    // CO2 (Number:Dimensionless) - Current: 0.06 %
    Healthy_Home_Coach_CO2: 'Healthy_Home_Coach_CO2',
    // Innentemperatur (Number:Temperature) - Current: 23.3 °C
    Healthy_Home_Coach_Innentemperatur: 'Healthy_Home_Coach_Innentemperatur',
    // Luftfeuchtigkeit (Number:Dimensionless) - Current: 61 %
    Healthy_Home_Coach_Luftfeuchtigkeit: 'Healthy_Home_Coach_Luftfeuchtigkeit',
    // Signalstärke (Number) - Current: 4
    Healthy_Home_Coach_Signalstarke: 'Healthy_Home_Coach_Signalstarke',
    // Empfangene Signalstärke (Number:Power) - Current: UNDEF
    iPad_Air_2024_Ylvie_Empfangene_Signalstarke: 'iPad_Air_2024_Ylvie_Empfangene_Signalstarke',
    // Empfangene Signalstärke (Number:Power) - Current: UNDEF
    iPhone_12_Ylvie_Empfangene_Signalstarke: 'iPhone_12_Ylvie_Empfangene_Signalstarke',
    // Empfangene Signalstärke (Number:Power) - Current: UNDEF
    iPhone_13_Nevia_Empfangene_Signalstarke: 'iPhone_13_Nevia_Empfangene_Signalstarke',
    // Empfangene Signalstärke (Number:Power) - Current: 39 dBm
    iPhone_16_Pro_Michi_Empfangene_Signalstarke: 'iPhone_16_Pro_Michi_Empfangene_Signalstarke',
    // Temperatur Abluft (Number:Temperature) - Current: 22.84 °C
    KNX_Helios_KWRL_Temperatur_Abluft: 'KNX_Helios_KWRL_Temperatur_Abluft',
    // Temperatur Außenluft (Number:Temperature) - Current: 11.19 °C
    KNX_Helios_KWRL_Temperatur_Aussenluft: 'KNX_Helios_KWRL_Temperatur_Aussenluft',
    // Temperatur Fortluft (Number:Temperature) - Current: 14.13 °C
    KNX_Helios_KWRL_Temperatur_Fortluft: 'KNX_Helios_KWRL_Temperatur_Fortluft',
    // Temperatur Zuluft (Number:Temperature) - Current: 21.14 °C
    KNX_Helios_KWRL_Temperatur_Zuluft: 'KNX_Helios_KWRL_Temperatur_Zuluft',
    // Windgeschwindigkeit (Number) - Current: 0
    KNX_Wetterstation_Windgeschwindigkeit: 'KNX_Wetterstation_Windgeschwindigkeit',
    // AC Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Power',
    // DC Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_DC_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_DC_Power',
    // P1 Amperage (Number:ElectricCurrent) - Current: 0 A
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Amperage',
    // P1 Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Power',
    // P1 Voltage (Number:ElectricPotential) - Current: 229.7914886475 V
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Voltage',
    // P2 Amperage (Number:ElectricCurrent) - Current: 0 A
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Amperage',
    // P2 Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Power',
    // P2 Voltage (Number:ElectricPotential) - Current: 227.4301300049 V
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Voltage',
    // P3 Amperage (Number:ElectricCurrent) - Current: 0 A
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Amperage',
    // P3 Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Power',
    // P3 Voltage (Number:ElectricPotential) - Current: 233.2806396484 V
    KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Voltage',
    // PV Str1 Amperage (Number:ElectricCurrent) - Current: 0 A
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Amperage',
    // PV Str1 Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Power',
    // PV Str1 Voltage (Number:ElectricPotential) - Current: 0.3735897541 V
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Voltage',
    // PV Str2 Amperage (Number:ElectricCurrent) - Current: 0 A
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Amperage',
    // PV Str2 Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Power',
    // PV Str2 Voltage (Number:ElectricPotential) - Current: 0.2911068797 V
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Voltage',
    // PV Str3 Amperage (Number:ElectricCurrent) - Current: 0 A
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Amperage',
    // PV Str3 Power (Number:Power) - Current: 0 W
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Power',
    // PV Str3 Voltage (Number:ElectricPotential) - Current: 0.7738879323 V
    KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Voltage',
    // Yield Day (Number:Energy) - Current: 14.7172518214317 kWh
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Day: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Day',
    // Yield Month (Number:Energy) - Current: 486.265413040339 kWh
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Month: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Month',
    // Yield Total (Number:Energy) - Current: 30887.926634630618 kWh
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Total: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Total',
    // Yield Year (Number:Energy) - Current: 9743.124627287432 kWh
    KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Year: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Year',
    // Empfangene Signalstärke (Number:Power) - Current: 8 dBm
    Samsung_Galaxy_A55_Sabrina_Empfangene_Signalstarke: 'Samsung_Galaxy_A55_Sabrina_Empfangene_Signalstarke',
    // Atmospheric Humidity (Number:Dimensionless) - Current: 85.5 %
    Shelly_HT_Bad_Atmospheric_Humidity: 'Shelly_HT_Bad_Atmospheric_Humidity',
    // Battery Level (Number:Dimensionless) - Current: 29 %
    Shelly_HT_Bad_Battery_Level: 'Shelly_HT_Bad_Battery_Level',
    // Indoor Temperature (Number:Temperature) - Current: 23 °C
    Shelly_HT_Bad_Indoor_Temperature: 'Shelly_HT_Bad_Indoor_Temperature',
    // Signalstärke (Number) - Current: 2.0
    Shelly_HT_Bad_Signalstarke: 'Shelly_HT_Bad_Signalstarke',
    // Gesamtverbrauch (Number:Energy) - Current: 0 kWh
    Shelly_Plug_Buro_Keller_Gesamtverbrauch: 'Shelly_Plug_Buro_Keller_Gesamtverbrauch',
    // Temperatur Shelly Plug TV Keller (Number:Temperature) - Current: 25.6 °C
    Shelly_Plug_Buro_Keller_Indoor_Temperature: 'Shelly_Plug_Buro_Keller_Indoor_Temperature',
    // Signalstärke (Number) - Current: 4
    Shelly_Plug_Buro_Keller_Signalstarke: 'Shelly_Plug_Buro_Keller_Signalstarke',
    // Stromverbrauch (Number:Power) - Current: 21.43 W
    Shelly_Plug_Buro_Keller_Stromverbrauch: 'Shelly_Plug_Buro_Keller_Stromverbrauch',
    // Gesamtverbrauch (Number:Energy) - Current: 0 kWh
    Shelly_Plug_Speis_Gesamtverbrauch: 'Shelly_Plug_Speis_Gesamtverbrauch',
    // Temperatur Shelly Plug Speis (Number:Temperature) - Current: 26.3 °C
    Shelly_Plug_Speis_Indoor_Temperature: 'Shelly_Plug_Speis_Indoor_Temperature',
    // Signalstärke (Number) - Current: 4.0
    Shelly_Plug_Speis_Signalstarke: 'Shelly_Plug_Speis_Signalstarke',
    // Stromverbrauch (Number:Power) - Current: 50.96 W
    Shelly_Plug_Speis_Stromverbrauch: 'Shelly_Plug_Speis_Stromverbrauch',
    // Gesamtverbrauch (Number:Energy) - Current: 0 kWh
    Shelly_Plug_Wohnzimmer_Gesamtverbrauch: 'Shelly_Plug_Wohnzimmer_Gesamtverbrauch',
    // Signalstärke (Number) - Current: 2
    Shelly_Plug_Wohnzimmer_Signalstarke: 'Shelly_Plug_Wohnzimmer_Signalstarke',
    // Stromverbrauch (Number:Power) - Current: 10.57 W
    Shelly_Plug_Wohnzimmer_Stromverbrauch: 'Shelly_Plug_Wohnzimmer_Stromverbrauch',
    // Signalstärke (Number) - Current: 4
    Shelly_RGBW_PM_Buro_Keller_Signalstarke: 'Shelly_RGBW_PM_Buro_Keller_Signalstarke',
    // Atmospheric Humidity (Number:Dimensionless) - Current: 62 %
    ShellyHT_Wohnzimmer_Atmospheric_Humidity: 'ShellyHT_Wohnzimmer_Atmospheric_Humidity',
    // Battery Level (Number:Dimensionless) - Current: 100 %
    ShellyHT_Wohnzimmer_Battery_Level: 'ShellyHT_Wohnzimmer_Battery_Level',
    // Indoor Temperature (Number:Temperature) - Current: 23 °C
    ShellyHT_Wohnzimmer_Indoor_Temperature: 'ShellyHT_Wohnzimmer_Indoor_Temperature',
    // Signalstärke (Number) - Current: 4
    ShellyHT_Wohnzimmer_Signalstarke: 'ShellyHT_Wohnzimmer_Signalstarke',
  } as const,

  // Setpoint items (6 items)
  Setpoint: {
    // Licht Gang (Dimmer) - Current: 0
    DA1_Licht_Gang: 'DA1_Licht_Gang',
    // Licht Vorraum & Garderobe (Dimmer) - Current: 0
    DA1_Licht_Vorraum__Garderobe: 'DA1_Licht_Vorraum__Garderobe',
    // Licht WC (Dimmer) - Current: 0
    KNX_DA1_Licht_WC: 'KNX_DA1_Licht_WC',
    // Soll % (Number:Dimensionless) - Current: 31 %
    KNX_Helios_KWRL_Soll_Prozent: 'KNX_Helios_KWRL_Soll_Prozent',
    // Soll Stufe (Number) - Current: 1
    KNX_Helios_KWRL_Soll_Stufe_: 'KNX_Helios_KWRL_Soll_Stufe_',
    // Manuelle Stufe (Number:Dimensionless)
    KNX_Helios_ManualMode: 'KNX_Helios_ManualMode',
  } as const,

  // Status items (18 items)
  Status: {
    // Astro Sun Data Sonnenphase (String) - Current: NIGHT
    Astro_Sun_Data_Sonnenphase: 'Astro_Sun_Data_Sonnenphase',
    // Charging State (Switch) - Current: ON
    EVCC_Charging_State: 'EVCC_Charging_State',
    // Vehicle Connected (Switch) - Current: ON
    EVCC_Vehicle_Connected: 'EVCC_Vehicle_Connected',
    // Health Index (Number) - Current: 0
    Healthy_Home_Coach_Health_Index: 'Healthy_Home_Coach_Health_Index',
    // Ist % (Number:Dimensionless) - Current: 24.705882352941178 %
    KNX_Helios_KWRL_Ist_Prozent: 'KNX_Helios_KWRL_Ist_Prozent',
    // Ist Stufe (Number) - Current: 1.0
    KNX_Helios_KWRL_Ist_Stufe: 'KNX_Helios_KWRL_Ist_Stufe',
    // Außentemperatur (Number:Temperature) - Current: 5.1000000000000005 °C
    KNX_Wetterstation_Aussentemperatur: 'KNX_Wetterstation_Aussentemperatur',
    // Helligkeit (Number:Illuminance) - Current: 1 lx
    KNX_Wetterstation_Helligkeit: 'KNX_Wetterstation_Helligkeit',
    // Präsenzstatus Items (Group) - Current: ON
    Mobile_Devices_Presence: 'Mobile_Devices_Presence',
    // Low Battery (Switch) - Current: OFF
    Shelly_HT_Bad_Low_Battery: 'Shelly_HT_Bad_Low_Battery',
    // Eingang/Taste (Switch) - Current: OFF
    Shelly_RGBW_PM_Buro_Keller_EingangTaste: 'Shelly_RGBW_PM_Buro_Keller_EingangTaste',
    // Low Battery (Switch) - Current: OFF
    ShellyHT_Wohnzimmer_Low_Battery: 'ShellyHT_Wohnzimmer_Low_Battery',
    // Album Image (Image)
    Spotify_AlbumImage: 'Spotify_AlbumImage',
    // Album Image (Image)
    Spotify_AlbumImageUrl: 'Spotify_AlbumImageUrl',
    // Künstler (String) - Current: Böhse Onkelz
    Spotify_Kunstler: 'Spotify_Kunstler',
    // Titel (String) - Current: Das Geheimnis meiner Kraft
    Spotify_Titel: 'Spotify_Titel',
    // Track Duration (Number:Time) - Current: 228.933 s
    Spotify_Track_Duration: 'Spotify_Track_Duration',
    // Track Progress (Number:Time) - Current: 160.382 s
    Spotify_Track_Progress: 'Spotify_Track_Progress',
  } as const,

} as const

// =============================================================================
// FLAT ITEMS - All items in one object for backward compatibility
// =============================================================================

export const ITEMS = {
  // Anschlussraum
  Anschlussraum: 'Anschlussraum',
  // Astro Sun Data Sonnenphase
  Astro_Sun_Data_Sonnenphase: 'Astro_Sun_Data_Sonnenphase',
  // Bad
  Bad: 'Bad',
  // Büro
  Buero: 'Buero',
  // Büro
  BueroEG: 'BueroEG',
  // Licht Gang
  DA1_Licht_Gang: 'DA1_Licht_Gang',
  // Licht Vorraum & Garderobe
  DA1_Licht_Vorraum__Garderobe: 'DA1_Licht_Vorraum__Garderobe',
  // Erdgeschoss
  EG: 'EG',
  // ⌀ Luftfeuchtigkeit EG
  EG_Humidities: 'EG_Humidities',
  // ⌀ Temperatur EG
  EG_Temperatures: 'EG_Temperatures',
  // Group
  Einfahrt: 'Einfahrt',
  // Essen
  Essen: 'Essen',
  // Esstisch
  Esstisch: 'Esstisch',
  // EVCC
  EVCC: 'EVCC',
  // Available Version
  EVCC_Available_Version: 'EVCC_Available_Version',
  // Charged Energy
  EVCC_Charged_Energy: 'EVCC_Charged_Energy',
  // Charger Feature: Heating
  EVCC_Charger_Feature_Heating: 'EVCC_Charger_Feature_Heating',
  // Charger Feature: Integrated Device
  EVCC_Charger_Feature_Integrated_Device: 'EVCC_Charger_Feature_Integrated_Device',
  // Charging Active Phases
  EVCC_Charging_Active_Phases: 'EVCC_Charging_Active_Phases',
  // Charging Current
  EVCC_Charging_Current: 'EVCC_Charging_Current',
  // Charging Duration
  EVCC_Charging_Duration: 'EVCC_Charging_Duration',
  // Charging Enabled
  EVCC_Charging_Enabled: 'EVCC_Charging_Enabled',
  // Charging Enabled Phases
  EVCC_Charging_Enabled_Phases: 'EVCC_Charging_Enabled_Phases',
  // Charging Limit Energy
  EVCC_Charging_Limit_Energy: 'EVCC_Charging_Limit_Energy',
  // Charging Limit SoC
  EVCC_Charging_Limit_SoC: 'EVCC_Charging_Limit_SoC',
  // Charging max Current
  EVCC_Charging_max_Current: 'EVCC_Charging_max_Current',
  // Charging min Current
  EVCC_Charging_min_Current: 'EVCC_Charging_min_Current',
  // Charging Mode
  EVCC_Charging_Mode: 'EVCC_Charging_Mode',
  // Charging Power
  EVCC_Charging_Power: 'EVCC_Charging_Power',
  // Charging Remaining Duration
  EVCC_Charging_Remaining_Duration: 'EVCC_Charging_Remaining_Duration',
  // Charging Remaining Energy
  EVCC_Charging_Remaining_Energy: 'EVCC_Charging_Remaining_Energy',
  // Charging State
  EVCC_Charging_State: 'EVCC_Charging_State',
  // Effective Charging Limit
  EVCC_Effective_Charging_Limit: 'EVCC_Effective_Charging_Limit',
  // Grid Power
  EVCC_Grid_Power: 'EVCC_Grid_Power',
  // Home Power
  EVCC_Home_Power: 'EVCC_Home_Power',
  // Loadpoint Title
  EVCC_Loadpoint_Title: 'EVCC_Loadpoint_Title',
  // PV Power
  EVCC_PV_Power: 'EVCC_PV_Power',
  // Vehicle Capacity
  EVCC_Vehicle_Capacity: 'EVCC_Vehicle_Capacity',
  // Vehicle Charging Limit SoC
  EVCC_Vehicle_Charging_Limit_SoC: 'EVCC_Vehicle_Charging_Limit_SoC',
  // Vehicle Connected
  EVCC_Vehicle_Connected: 'EVCC_Vehicle_Connected',
  // Vehicle Connected Duration
  EVCC_Vehicle_Connected_Duration: 'EVCC_Vehicle_Connected_Duration',
  // Vehicle Data Access
  EVCC_Vehicle_Data_Access: 'EVCC_Vehicle_Data_Access',
  // Vehicle Min SoC
  EVCC_Vehicle_Min_SoC: 'EVCC_Vehicle_Min_SoC',
  // Vehicle Name
  EVCC_Vehicle_Name: 'EVCC_Vehicle_Name',
  // Vehicle Odometer
  EVCC_Vehicle_Odometer: 'EVCC_Vehicle_Odometer',
  // Vehicle Plan Enabled
  EVCC_Vehicle_Plan_Enabled: 'EVCC_Vehicle_Plan_Enabled',
  // Vehicle Plan SoC
  EVCC_Vehicle_Plan_SoC: 'EVCC_Vehicle_Plan_SoC',
  // Vehicle Plan Time
  EVCC_Vehicle_Plan_Time: 'EVCC_Vehicle_Plan_Time',
  // Vehicle Range
  EVCC_Vehicle_Range: 'EVCC_Vehicle_Range',
  // Vehicle SoC
  EVCC_Vehicle_SoC: 'EVCC_Vehicle_SoC',
  // Vehicle Title
  EVCC_Vehicle_Title: 'EVCC_Vehicle_Title',
  // Version
  EVCC_Version: 'EVCC_Version',
  // Group
  Fitnessraum: 'Fitnessraum',
  // Gang
  Gang: 'Gang',
  // Group
  Garage: 'Garage',
  // Go-eCharger
  GoeCharger: 'GoeCharger',
  // Access Configuration
  GoeCharger_Access_Configuration: 'GoeCharger_Access_Configuration',
  // Allow Charging
  GoeCharger_Allow_Charging: 'GoeCharger_Allow_Charging',
  // Awatttar Max Price
  GoeCharger_Awatttar_Max_Price: 'GoeCharger_Awatttar_Max_Price',
  // Cable Encoding
  GoeCharger_Cable_Encoding: 'GoeCharger_Cable_Encoding',
  // Current L1
  GoeCharger_Current_L1: 'GoeCharger_Current_L1',
  // Current L2
  GoeCharger_Current_L2: 'GoeCharger_Current_L2',
  // Current L3
  GoeCharger_Current_L3: 'GoeCharger_Current_L3',
  // Current Session Charge Energy Limit
  GoeCharger_Current_Session_Charge_Energy_Limit: 'GoeCharger_Current_Session_Charge_Energy_Limit',
  // Current Session Charged Energy
  GoeCharger_Current_Session_Charged_Energy: 'GoeCharger_Current_Session_Charged_Energy',
  // Error Code
  GoeCharger_Error_Code: 'GoeCharger_Error_Code',
  // Firmware
  GoeCharger_Firmware: 'GoeCharger_Firmware',
  // Force state
  GoeCharger_Force_state: 'GoeCharger_Force_state',
  // Maximum Current
  GoeCharger_Maximum_Current: 'GoeCharger_Maximum_Current',
  // Maximum Current Temporary
  GoeCharger_Maximum_Current_Temporary: 'GoeCharger_Maximum_Current_Temporary',
  // Phases
  GoeCharger_Phases: 'GoeCharger_Phases',
  // Power All
  GoeCharger_Power_All: 'GoeCharger_Power_All',
  // Power L1
  GoeCharger_Power_L1: 'GoeCharger_Power_L1',
  // Power L2
  GoeCharger_Power_L2: 'GoeCharger_Power_L2',
  // Power L3
  GoeCharger_Power_L3: 'GoeCharger_Power_L3',
  // PWM signal status
  GoeCharger_PWM_signal_status: 'GoeCharger_PWM_signal_status',
  // Temperature circuit board
  GoeCharger_Temperature_circuit_board: 'GoeCharger_Temperature_circuit_board',
  // Temperature type 2 port
  GoeCharger_Temperature_type_2_port: 'GoeCharger_Temperature_type_2_port',
  // Total Charged Energy
  GoeCharger_Total_Charged_Energy: 'GoeCharger_Total_Charged_Energy',
  // Transaction
  GoeCharger_Transaction: 'GoeCharger_Transaction',
  // Voltage L1
  GoeCharger_Voltage_L1: 'GoeCharger_Voltage_L1',
  // Voltage L2
  GoeCharger_Voltage_L2: 'GoeCharger_Voltage_L2',
  // Voltage L3
  GoeCharger_Voltage_L3: 'GoeCharger_Voltage_L3',
  // Brunnengasse 19, 7341 Lindgraben
  Hauer: 'Hauer',
  // Healthy Home Coach
  Healthy_Home_Coach: 'Healthy_Home_Coach',
  // CO2
  Healthy_Home_Coach_CO2: 'Healthy_Home_Coach_CO2',
  // Health Index
  Healthy_Home_Coach_Health_Index: 'Healthy_Home_Coach_Health_Index',
  // Innentemperatur
  Healthy_Home_Coach_Innentemperatur: 'Healthy_Home_Coach_Innentemperatur',
  // Luftfeuchtigkeit
  Healthy_Home_Coach_Luftfeuchtigkeit: 'Healthy_Home_Coach_Luftfeuchtigkeit',
  // Signalstärke
  Healthy_Home_Coach_Signalstarke: 'Healthy_Home_Coach_Signalstarke',
  // iPad Air (2024) Ylvie
  iPad_Air_2024_Ylvie: 'iPad_Air_2024_Ylvie',
  // Access-Point
  iPad_Air_2024_Ylvie_AccessPoint: 'iPad_Air_2024_Ylvie_AccessPoint',
  // Drahtloses Netzwerk
  iPad_Air_2024_Ylvie_Drahtloses_Netzwerk: 'iPad_Air_2024_Ylvie_Drahtloses_Netzwerk',
  // Empfangene Signalstärke
  iPad_Air_2024_Ylvie_Empfangene_Signalstarke: 'iPad_Air_2024_Ylvie_Empfangene_Signalstarke',
  // Experience
  iPad_Air_2024_Ylvie_Experience: 'iPad_Air_2024_Ylvie_Experience',
  // Hostname
  iPad_Air_2024_Ylvie_Hostname: 'iPad_Air_2024_Ylvie_Hostname',
  // IP Addresse
  iPad_Air_2024_Ylvie_IP_Addresse: 'iPad_Air_2024_Ylvie_IP_Addresse',
  // MAC Adresse
  iPad_Air_2024_Ylvie_MAC_Adresse: 'iPad_Air_2024_Ylvie_MAC_Adresse',
  // Name
  iPad_Air_2024_Ylvie_Name: 'iPad_Air_2024_Ylvie_Name',
  // Online
  iPad_Air_2024_Ylvie_Online: 'iPad_Air_2024_Ylvie_Online',
  // Online seit
  iPad_Air_2024_Ylvie_Online_seit: 'iPad_Air_2024_Ylvie_Online_seit',
  // Zuletzt gesehen
  iPad_Air_2024_Ylvie_Zuletzt_gesehen: 'iPad_Air_2024_Ylvie_Zuletzt_gesehen',
  // iPhone 12 Ylvie
  iPhone_12_Ylvie: 'iPhone_12_Ylvie',
  // Access-Point
  iPhone_12_Ylvie_AccessPoint: 'iPhone_12_Ylvie_AccessPoint',
  // Drahtloses Netzwerk
  iPhone_12_Ylvie_Drahtloses_Netzwerk: 'iPhone_12_Ylvie_Drahtloses_Netzwerk',
  // Empfangene Signalstärke
  iPhone_12_Ylvie_Empfangene_Signalstarke: 'iPhone_12_Ylvie_Empfangene_Signalstarke',
  // Experience
  iPhone_12_Ylvie_Experience: 'iPhone_12_Ylvie_Experience',
  // Hostname
  iPhone_12_Ylvie_Hostname: 'iPhone_12_Ylvie_Hostname',
  // IP Addresse
  iPhone_12_Ylvie_IP_Addresse: 'iPhone_12_Ylvie_IP_Addresse',
  // MAC Adresse
  iPhone_12_Ylvie_MAC_Adresse: 'iPhone_12_Ylvie_MAC_Adresse',
  // Online
  iPhone_12_Ylvie_Online: 'iPhone_12_Ylvie_Online',
  // Online seit
  iPhone_12_Ylvie_Online_seit: 'iPhone_12_Ylvie_Online_seit',
  // Zuletzt gesehen
  iPhone_12_Ylvie_Zuletzt_gesehen: 'iPhone_12_Ylvie_Zuletzt_gesehen',
  // iPhone 13 Nevia
  iPhone_13_Nevia: 'iPhone_13_Nevia',
  // Access-Point
  iPhone_13_Nevia_AccessPoint: 'iPhone_13_Nevia_AccessPoint',
  // Drahtloses Netzwerk
  iPhone_13_Nevia_Drahtloses_Netzwerk: 'iPhone_13_Nevia_Drahtloses_Netzwerk',
  // Empfangene Signalstärke
  iPhone_13_Nevia_Empfangene_Signalstarke: 'iPhone_13_Nevia_Empfangene_Signalstarke',
  // Experience
  iPhone_13_Nevia_Experience: 'iPhone_13_Nevia_Experience',
  // Hostname
  iPhone_13_Nevia_Hostname: 'iPhone_13_Nevia_Hostname',
  // IP Addresse
  iPhone_13_Nevia_IP_Addresse: 'iPhone_13_Nevia_IP_Addresse',
  // MAC Adresse
  iPhone_13_Nevia_MAC_Adresse: 'iPhone_13_Nevia_MAC_Adresse',
  // Name
  iPhone_13_Nevia_Name: 'iPhone_13_Nevia_Name',
  // Online
  iPhone_13_Nevia_Online: 'iPhone_13_Nevia_Online',
  // Online seit
  iPhone_13_Nevia_Online_seit: 'iPhone_13_Nevia_Online_seit',
  // Zuletzt gesehen
  iPhone_13_Nevia_Zuletzt_gesehen: 'iPhone_13_Nevia_Zuletzt_gesehen',
  // iPhone 16 Pro Michi
  iPhone_16_Pro_Michi: 'iPhone_16_Pro_Michi',
  // Access-Point
  iPhone_16_Pro_Michi_AccessPoint: 'iPhone_16_Pro_Michi_AccessPoint',
  // Drahtloses Netzwerk
  iPhone_16_Pro_Michi_Drahtloses_Netzwerk: 'iPhone_16_Pro_Michi_Drahtloses_Netzwerk',
  // Empfangene Signalstärke
  iPhone_16_Pro_Michi_Empfangene_Signalstarke: 'iPhone_16_Pro_Michi_Empfangene_Signalstarke',
  // Experience
  iPhone_16_Pro_Michi_Experience: 'iPhone_16_Pro_Michi_Experience',
  // Hostname
  iPhone_16_Pro_Michi_Hostname: 'iPhone_16_Pro_Michi_Hostname',
  // IP Addresse
  iPhone_16_Pro_Michi_IP_Addresse: 'iPhone_16_Pro_Michi_IP_Addresse',
  // MAC Adresse
  iPhone_16_Pro_Michi_MAC_Adresse: 'iPhone_16_Pro_Michi_MAC_Adresse',
  // Name
  iPhone_16_Pro_Michi_Name: 'iPhone_16_Pro_Michi_Name',
  // Online
  iPhone_16_Pro_Michi_Online: 'iPhone_16_Pro_Michi_Online',
  // Online seit
  iPhone_16_Pro_Michi_Online_seit: 'iPhone_16_Pro_Michi_Online_seit',
  // Zuletzt gesehen
  iPhone_16_Pro_Michi_Zuletzt_gesehen: 'iPhone_16_Pro_Michi_Zuletzt_gesehen',
  // Keller
  Keller: 'Keller',
  // Multimedia
  KNX_2fach_Taster_Buro_Keller_Stiege_Multimedia: 'KNX_2fach_Taster_Buro_Keller_Stiege_Multimedia',
  // Licht WC
  KNX_DA1_Licht_WC: 'KNX_DA1_Licht_WC',
  // KNX Helios KWRL
  KNX_Helios_KWRL: 'KNX_Helios_KWRL',
  // Ist %
  KNX_Helios_KWRL_Ist_Prozent: 'KNX_Helios_KWRL_Ist_Prozent',
  // Ist Stufe
  KNX_Helios_KWRL_Ist_Stufe: 'KNX_Helios_KWRL_Ist_Stufe',
  // Restlaufzeit Filter
  KNX_Helios_KWRL_Restlaufzeit_Filter: 'KNX_Helios_KWRL_Restlaufzeit_Filter',
  // Soll %
  KNX_Helios_KWRL_Soll_Prozent: 'KNX_Helios_KWRL_Soll_Prozent',
  // Soll Stufe
  KNX_Helios_KWRL_Soll_Stufe_: 'KNX_Helios_KWRL_Soll_Stufe_',
  // Temperatur Abluft
  KNX_Helios_KWRL_Temperatur_Abluft: 'KNX_Helios_KWRL_Temperatur_Abluft',
  // Temperatur Außenluft
  KNX_Helios_KWRL_Temperatur_Aussenluft: 'KNX_Helios_KWRL_Temperatur_Aussenluft',
  // Temperatur Fortluft
  KNX_Helios_KWRL_Temperatur_Fortluft: 'KNX_Helios_KWRL_Temperatur_Fortluft',
  // Temperatur Zuluft
  KNX_Helios_KWRL_Temperatur_Zuluft: 'KNX_Helios_KWRL_Temperatur_Zuluft',
  // Manuelle Stufe
  KNX_Helios_ManualMode: 'KNX_Helios_ManualMode',
  // KNX Hörmann Garagentor
  KNX_Hormann_Garagentor: 'KNX_Hormann_Garagentor',
  // Garagentor
  KNX_Hormann_Garagentor_Garagentor: 'KNX_Hormann_Garagentor_Garagentor',
  // Status Tor geschlossen
  KNX_Hormann_Garagentor_Status_Tor_geschlossen: 'KNX_Hormann_Garagentor_Status_Tor_geschlossen',
  // Status Tor offen
  KNX_Hormann_Garagentor_Status_Tor_offen: 'KNX_Hormann_Garagentor_Status_Tor_offen',
  // Raffstore Esstisch
  KNX_JA1_Raffstore_Esstisch: 'KNX_JA1_Raffstore_Esstisch',
  // Raffstore Wohnzimmer
  KNX_JA1_Raffstore_Wohnzimmer: 'KNX_JA1_Raffstore_Wohnzimmer',
  // Raffstore Wohnzimmer Straße
  KNX_JA1_Raffstore_Wohnzimmer_Strasse: 'KNX_JA1_Raffstore_Wohnzimmer_Strasse',
  // Rollladen Michi & Sabrina
  KNX_JA2_Rollladen_Michi__Sabrina: 'KNX_JA2_Rollladen_Michi__Sabrina',
  // Rollladen Nevia
  KNX_JA2_Rollladen_Nevia: 'KNX_JA2_Rollladen_Nevia',
  // Rollladen Schrankraum
  KNX_JA2_Rollladen_Schrankraum: 'KNX_JA2_Rollladen_Schrankraum',
  // Rollladen Ylvie
  KNX_JA2_Rollladen_Ylvie: 'KNX_JA2_Rollladen_Ylvie',
  // Rollladen Gang
  KNX_RA1_CH01: 'KNX_RA1_CH01',
  // Rollladen Gang
  KNX_RA1_CH04: 'KNX_RA1_CH04',
  // Markise Terrasse
  KNX_RA1_Markise_Terrasse: 'KNX_RA1_Markise_Terrasse',
  // Rollladen Büro
  KNX_RA1_Rollladen_Buro: 'KNX_RA1_Rollladen_Buro',
  // Licht Büro
  KNX_SAH1_Stromerkennung_Licht_Buro: 'KNX_SAH1_Stromerkennung_Licht_Buro',
  // Licht Nevia
  KNX_SAH1_Stromerkennung_Licht_Nevia: 'KNX_SAH1_Stromerkennung_Licht_Nevia',
  // Licht Schlafzimmer
  KNX_SAH1_Stromerkennung_Licht_Schlafzimmer: 'KNX_SAH1_Stromerkennung_Licht_Schlafzimmer',
  // Licht Schrankraum
  KNX_SAH1_Stromerkennung_Licht_Schrankraum: 'KNX_SAH1_Stromerkennung_Licht_Schrankraum',
  // Licht Ylvie
  KNX_SAH1_Stromerkennung_Licht_Ylvie: 'KNX_SAH1_Stromerkennung_Licht_Ylvie',
  // Licht Einfahrt
  KNX_SAH2_Licht_Einfahrt: 'KNX_SAH2_Licht_Einfahrt',
  // Licht Eingang
  KNX_SAH2_Licht_Eingang: 'KNX_SAH2_Licht_Eingang',
  // Licht Garage
  KNX_SAH2_Licht_Garage: 'KNX_SAH2_Licht_Garage',
  // Licht Keller Anschlussraum
  KNX_SAH2_Licht_Keller_Anschlussraum: 'KNX_SAH2_Licht_Keller_Anschlussraum',
  // Licht Keller Gang
  KNX_SAH2_Licht_Keller_Gang: 'KNX_SAH2_Licht_Keller_Gang',
  // Licht Terrasse Säulen
  KNX_SAH2_Licht_Terrasse_Saulen: 'KNX_SAH2_Licht_Terrasse_Saulen',
  // Licht Terrasse Wand
  KNX_SAH2_Licht_Terrasse_Wand: 'KNX_SAH2_Licht_Terrasse_Wand',
  // Licht WC Keller
  KNX_SAH2_Licht_WC_Keller: 'KNX_SAH2_Licht_WC_Keller',
  // Licht Bad Dusche
  KNX_SAH3_Licht_Bad_Dusche: 'KNX_SAH3_Licht_Bad_Dusche',
  // Licht Bad Spiegel
  KNX_SAH3_Licht_Bad_Spiegel: 'KNX_SAH3_Licht_Bad_Spiegel',
  // Licht Fitness
  KNX_SAH3_Licht_Fitness: 'KNX_SAH3_Licht_Fitness',
  // Licht Schleuse
  KNX_SAH3_Licht_Schleuse: 'KNX_SAH3_Licht_Schleuse',
  // Licht Serverraum
  KNX_SAH3_Licht_Serverraum: 'KNX_SAH3_Licht_Serverraum',
  // Licht Technikraum
  KNX_SAH3_Licht_Technikraum: 'KNX_SAH3_Licht_Technikraum',
  // Licht Waschraum
  KNX_SAH3_Licht_Waschraum: 'KNX_SAH3_Licht_Waschraum',
  // KNX Status Spät
  KNX_State_Flag_Item_Late: 'KNX_State_Flag_Item_Late',
  // Status Nacht
  KNX_Status_Flags_KNX_Status_Nacht: 'KNX_Status_Flags_KNX_Status_Nacht',
  // Außentemperatur
  KNX_Wetterstation_Aussentemperatur: 'KNX_Wetterstation_Aussentemperatur',
  // Dämmerschwelle überschritten
  KNX_Wetterstation_Dammerschwelle_uberschritten: 'KNX_Wetterstation_Dammerschwelle_uberschritten',
  // Helligkeit
  KNX_Wetterstation_Helligkeit: 'KNX_Wetterstation_Helligkeit',
  // Regen
  KNX_Wetterstation_Regen: 'KNX_Wetterstation_Regen',
  // Windgeschwindigkeit
  KNX_Wetterstation_Windgeschwindigkeit: 'KNX_Wetterstation_Windgeschwindigkeit',
  // KOSTAL PLENTICORE Plus 10.0 (no Battery)
  KOSTAL_PLENTICORE_Plus_100_no_Battery: 'KOSTAL_PLENTICORE_Plus_100_no_Battery',
  // AC Frequency
  KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Frequency: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Frequency',
  // AC Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Power',
  // CO2 Savings Day
  KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Day: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Day',
  // CO2 Savings Month
  KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Month: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Month',
  // CO2 Savings Total
  KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Total: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Total',
  // CO2 Savings Year
  KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Year: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Year',
  // Cos Phi
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Cos_Phi: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Cos_Phi',
  // DC Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_DC_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_DC_Power',
  // Feed-in Limit
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit',
  // Feed-in Limit Relative
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit_Relative: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit_Relative',
  // MC Errors
  KOSTAL_PLENTICORE_Plus_100_no_Battery_MC_Errors: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_MC_Errors',
  // P1 Amperage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Amperage',
  // P1 Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Power',
  // P1 Voltage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Voltage',
  // P2 Amperage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Amperage',
  // P2 Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Power',
  // P2 Voltage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Voltage',
  // P3 Amperage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Amperage',
  // P3 Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Power',
  // P3 Voltage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Voltage',
  // PV Str1 Amperage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Amperage',
  // PV Str1 Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Power',
  // PV Str1 Voltage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Voltage',
  // PV Str2 Amperage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Amperage',
  // PV Str2 Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Power',
  // PV Str2 Voltage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Voltage',
  // PV Str3 Amperage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Amperage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Amperage',
  // PV Str3 Power
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Power: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Power',
  // PV Str3 Voltage
  KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Voltage: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Voltage',
  // SCB Errors
  KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Errors: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Errors',
  // SCB Warnings
  KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Warnings: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Warnings',
  // SFH Errors
  KOSTAL_PLENTICORE_Plus_100_no_Battery_SFH_Errors: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SFH_Errors',
  // Uptime
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Uptime: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Uptime',
  // Yield Day
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Day: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Day',
  // Yield Month
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Month: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Month',
  // Yield Total
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Total: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Total',
  // Yield Year
  KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Year: 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Year',
  // Küche
  Kueche: 'Kueche',
  // Präsenzstatus Items
  Mobile_Devices_Presence: 'Mobile_Devices_Presence',
  // Zimmer Nevia
  Nevia: 'Nevia',
  // Zimmer Sabrina & Michi
  SabrinaMichi: 'SabrinaMichi',
  // Licht Esstisch
  SAH1_Stromerkennung_Licht_Esstisch: 'SAH1_Stromerkennung_Licht_Esstisch',
  // Licht Speis
  SAH1_Stromerkennung_Licht_Speis: 'SAH1_Stromerkennung_Licht_Speis',
  // Licht Keller Büro
  SAH2_Licht_Keller_Buro: 'SAH2_Licht_Keller_Buro',
  // Licht Couch
  SAH3_Licht_Couch: 'SAH3_Licht_Couch',
  // Licht TV
  SAH3_Licht_TV: 'SAH3_Licht_TV',
  // Samsung Galaxy A55 Sabrina
  Samsung_Galaxy_A55_Sabrina: 'Samsung_Galaxy_A55_Sabrina',
  // Access-Point
  Samsung_Galaxy_A55_Sabrina_AccessPoint: 'Samsung_Galaxy_A55_Sabrina_AccessPoint',
  // Drahtloses Netzwerk
  Samsung_Galaxy_A55_Sabrina_Drahtloses_Netzwerk: 'Samsung_Galaxy_A55_Sabrina_Drahtloses_Netzwerk',
  // Empfangene Signalstärke
  Samsung_Galaxy_A55_Sabrina_Empfangene_Signalstarke: 'Samsung_Galaxy_A55_Sabrina_Empfangene_Signalstarke',
  // Experience
  Samsung_Galaxy_A55_Sabrina_Experience: 'Samsung_Galaxy_A55_Sabrina_Experience',
  // Hostname
  Samsung_Galaxy_A55_Sabrina_Hostname: 'Samsung_Galaxy_A55_Sabrina_Hostname',
  // IP Addresse
  Samsung_Galaxy_A55_Sabrina_IP_Addresse: 'Samsung_Galaxy_A55_Sabrina_IP_Addresse',
  // MAC Adresse
  Samsung_Galaxy_A55_Sabrina_MAC_Adresse: 'Samsung_Galaxy_A55_Sabrina_MAC_Adresse',
  // Name
  Samsung_Galaxy_A55_Sabrina_Name: 'Samsung_Galaxy_A55_Sabrina_Name',
  // Online
  Samsung_Galaxy_A55_Sabrina_Online: 'Samsung_Galaxy_A55_Sabrina_Online',
  // Online seit
  Samsung_Galaxy_A55_Sabrina_Online_seit: 'Samsung_Galaxy_A55_Sabrina_Online_seit',
  // Zuletzt gesehen
  Samsung_Galaxy_A55_Sabrina_Zuletzt_gesehen: 'Samsung_Galaxy_A55_Sabrina_Zuletzt_gesehen',
  // Samsung TV Keller
  Samsung_TV_Keller: 'Samsung_TV_Keller',
  // Art Mode
  Samsung_TV_Keller_Art_Mode: 'Samsung_TV_Keller_Art_Mode',
  // Artwork Orientation
  Samsung_TV_Keller_Artwork_Orientation: 'Samsung_TV_Keller_Artwork_Orientation',
  // Kanal
  Samsung_TV_Keller_Kanal: 'Samsung_TV_Keller_Kanal',
  // Kanalnummer
  Samsung_TV_Keller_Kanalnummer: 'Samsung_TV_Keller_Kanalnummer',
  // Lautstärke
  Samsung_TV_Keller_Lautstarke: 'Samsung_TV_Keller_Lautstarke',
  // Power
  Samsung_TV_Keller_Power: 'Samsung_TV_Keller_Power',
  // Source
  Samsung_TV_Keller_Source: 'Samsung_TV_Keller_Source',
  // Stumm schalten
  Samsung_TV_Keller_Stumm_schalten: 'Samsung_TV_Keller_Stumm_schalten',
  // Tastendruck
  Samsung_TV_Keller_Tastendruck: 'Samsung_TV_Keller_Tastendruck',
  // Titel
  Samsung_TV_Keller_Titel: 'Samsung_TV_Keller_Titel',
  // Samsung TV Wohnzimmer
  Samsung_TV_Wohnzimmer: 'Samsung_TV_Wohnzimmer',
  // Art Mode
  Samsung_TV_Wohnzimmer_Art_Mode: 'Samsung_TV_Wohnzimmer_Art_Mode',
  // Artwork Orientation
  Samsung_TV_Wohnzimmer_Artwork_Orientation: 'Samsung_TV_Wohnzimmer_Artwork_Orientation',
  // Kanal
  Samsung_TV_Wohnzimmer_Kanal: 'Samsung_TV_Wohnzimmer_Kanal',
  // Kanalnummer
  Samsung_TV_Wohnzimmer_Kanalnummer: 'Samsung_TV_Wohnzimmer_Kanalnummer',
  // Lautstärke
  Samsung_TV_Wohnzimmer_Lautstarke: 'Samsung_TV_Wohnzimmer_Lautstarke',
  // Power
  Samsung_TV_Wohnzimmer_Power: 'Samsung_TV_Wohnzimmer_Power',
  // Source
  Samsung_TV_Wohnzimmer_Source: 'Samsung_TV_Wohnzimmer_Source',
  // Stumm schalten
  Samsung_TV_Wohnzimmer_Stumm_schalten: 'Samsung_TV_Wohnzimmer_Stumm_schalten',
  // Tastendruck
  Samsung_TV_Wohnzimmer_Tastendruck: 'Samsung_TV_Wohnzimmer_Tastendruck',
  // Titel
  Samsung_TV_Wohnzimmer_Titel: 'Samsung_TV_Wohnzimmer_Titel',
  // Group
  Schleuse: 'Schleuse',
  // Group
  Schrankraum: 'Schrankraum',
  // Group
  Serverraum: 'Serverraum',
  // Licht Küche
  SHA1_Stromerkennung_Licht_Kuche: 'SHA1_Stromerkennung_Licht_Kuche',
  // Shelly Color Bulbs HSB
  Shelly_Color_Bulbs_Esstisch: 'Shelly_Color_Bulbs_Esstisch',
  // Shelly Color Bulbs Farbwahl
  Shelly_Color_Bulbs_Esstisch_White: 'Shelly_Color_Bulbs_Esstisch_White',
  // Shelly HT Bad
  Shelly_HT_Bad: 'Shelly_HT_Bad',
  // Atmospheric Humidity
  Shelly_HT_Bad_Atmospheric_Humidity: 'Shelly_HT_Bad_Atmospheric_Humidity',
  // Battery Level
  Shelly_HT_Bad_Battery_Level: 'Shelly_HT_Bad_Battery_Level',
  // Indoor Temperature
  Shelly_HT_Bad_Indoor_Temperature: 'Shelly_HT_Bad_Indoor_Temperature',
  // Letzter Fehler
  Shelly_HT_Bad_Letzter_Fehler: 'Shelly_HT_Bad_Letzter_Fehler',
  // Low Battery
  Shelly_HT_Bad_Low_Battery: 'Shelly_HT_Bad_Low_Battery',
  // Signalstärke
  Shelly_HT_Bad_Signalstarke: 'Shelly_HT_Bad_Signalstarke',
  // Shelly Plug Büro Keller
  Shelly_Plug_Buro_Keller: 'Shelly_Plug_Buro_Keller',
  // Betrieb
  Shelly_Plug_Buro_Keller_Betrieb: 'Shelly_Plug_Buro_Keller_Betrieb',
  // Betriebs-LED aus
  Shelly_Plug_Buro_Keller_BetriebsLED_aus: 'Shelly_Plug_Buro_Keller_BetriebsLED_aus',
  // Gesamtverbrauch
  Shelly_Plug_Buro_Keller_Gesamtverbrauch: 'Shelly_Plug_Buro_Keller_Gesamtverbrauch',
  // Temperatur Shelly Plug TV Keller
  Shelly_Plug_Buro_Keller_Indoor_Temperature: 'Shelly_Plug_Buro_Keller_Indoor_Temperature',
  // Signalstärke
  Shelly_Plug_Buro_Keller_Signalstarke: 'Shelly_Plug_Buro_Keller_Signalstarke',
  // Status-LED aus
  Shelly_Plug_Buro_Keller_StatusLED_aus: 'Shelly_Plug_Buro_Keller_StatusLED_aus',
  // Stromverbrauch
  Shelly_Plug_Buro_Keller_Stromverbrauch: 'Shelly_Plug_Buro_Keller_Stromverbrauch',
  // Shelly Plug Speis
  Shelly_Plug_Speis: 'Shelly_Plug_Speis',
  // Betrieb
  Shelly_Plug_Speis_Betrieb: 'Shelly_Plug_Speis_Betrieb',
  // Betriebs-LED aus
  Shelly_Plug_Speis_BetriebsLED_aus: 'Shelly_Plug_Speis_BetriebsLED_aus',
  // Gesamtverbrauch
  Shelly_Plug_Speis_Gesamtverbrauch: 'Shelly_Plug_Speis_Gesamtverbrauch',
  // Temperatur Shelly Plug Speis
  Shelly_Plug_Speis_Indoor_Temperature: 'Shelly_Plug_Speis_Indoor_Temperature',
  // Signalstärke
  Shelly_Plug_Speis_Signalstarke: 'Shelly_Plug_Speis_Signalstarke',
  // Status-LED aus
  Shelly_Plug_Speis_StatusLED_aus: 'Shelly_Plug_Speis_StatusLED_aus',
  // Stromverbrauch
  Shelly_Plug_Speis_Stromverbrauch: 'Shelly_Plug_Speis_Stromverbrauch',
  // Shelly Plug Wohnzimmer
  Shelly_Plug_Wohnzimmer: 'Shelly_Plug_Wohnzimmer',
  // Betrieb
  Shelly_Plug_Wohnzimmer_Betrieb: 'Shelly_Plug_Wohnzimmer_Betrieb',
  // Gesamtverbrauch
  Shelly_Plug_Wohnzimmer_Gesamtverbrauch: 'Shelly_Plug_Wohnzimmer_Gesamtverbrauch',
  // Signalstärke
  Shelly_Plug_Wohnzimmer_Signalstarke: 'Shelly_Plug_Wohnzimmer_Signalstarke',
  // Status-LED aus
  Shelly_Plug_Wohnzimmer_StatusLED_aus: 'Shelly_Plug_Wohnzimmer_StatusLED_aus',
  // Stromverbrauch
  Shelly_Plug_Wohnzimmer_Stromverbrauch: 'Shelly_Plug_Wohnzimmer_Stromverbrauch',
  // Shelly RGBW PM Büro Keller
  Shelly_RGBW_PM_Buro_Keller: 'Shelly_RGBW_PM_Buro_Keller',
  // Auto-AN-Timer
  Shelly_RGBW_PM_Buro_Keller_AutoANTimer: 'Shelly_RGBW_PM_Buro_Keller_AutoANTimer',
  // Auto-AUS Timer
  Shelly_RGBW_PM_Buro_Keller_AutoAUS_Timer: 'Shelly_RGBW_PM_Buro_Keller_AutoAUS_Timer',
  // Blau
  Shelly_RGBW_PM_Buro_Keller_Blau: 'Shelly_RGBW_PM_Buro_Keller_Blau',
  // Eingang/Taste
  Shelly_RGBW_PM_Buro_Keller_EingangTaste: 'Shelly_RGBW_PM_Buro_Keller_EingangTaste',
  // Farbe
  Shelly_RGBW_PM_Buro_Keller_Farbe: 'Shelly_RGBW_PM_Buro_Keller_Farbe',
  // Firmwareaktualisierung verfügbar
  Shelly_RGBW_PM_Buro_Keller_Firmwareaktualisierung_verfugbar: 'Shelly_RGBW_PM_Buro_Keller_Firmwareaktualisierung_verfugbar',
  // Grün
  Shelly_RGBW_PM_Buro_Keller_Grun: 'Shelly_RGBW_PM_Buro_Keller_Grun',
  // Helligkeit
  Shelly_RGBW_PM_Buro_Keller_Helligkeit: 'Shelly_RGBW_PM_Buro_Keller_Helligkeit',
  // Laufzeit
  Shelly_RGBW_PM_Buro_Keller_Laufzeit: 'Shelly_RGBW_PM_Buro_Keller_Laufzeit',
  // Letzte Aktivität
  Shelly_RGBW_PM_Buro_Keller_Letzte_Aktivitat: 'Shelly_RGBW_PM_Buro_Keller_Letzte_Aktivitat',
  // Rot
  Shelly_RGBW_PM_Buro_Keller_Rot: 'Shelly_RGBW_PM_Buro_Keller_Rot',
  // Signalstärke
  Shelly_RGBW_PM_Buro_Keller_Signalstarke: 'Shelly_RGBW_PM_Buro_Keller_Signalstarke',
  // Volltonfarbe
  Shelly_RGBW_PM_Buro_Keller_Volltonfarbe: 'Shelly_RGBW_PM_Buro_Keller_Volltonfarbe',
  // Weiß
  Shelly_RGBW_PM_Buro_Keller_Weiss: 'Shelly_RGBW_PM_Buro_Keller_Weiss',
  // ShellyHT Wohnzimmer
  ShellyHT_Wohnzimmer: 'ShellyHT_Wohnzimmer',
  // Atmospheric Humidity
  ShellyHT_Wohnzimmer_Atmospheric_Humidity: 'ShellyHT_Wohnzimmer_Atmospheric_Humidity',
  // Battery Level
  ShellyHT_Wohnzimmer_Battery_Level: 'ShellyHT_Wohnzimmer_Battery_Level',
  // Indoor Temperature
  ShellyHT_Wohnzimmer_Indoor_Temperature: 'ShellyHT_Wohnzimmer_Indoor_Temperature',
  // Letzter Fehler
  ShellyHT_Wohnzimmer_Letzter_Fehler: 'ShellyHT_Wohnzimmer_Letzter_Fehler',
  // Low Battery
  ShellyHT_Wohnzimmer_Low_Battery: 'ShellyHT_Wohnzimmer_Low_Battery',
  // Signalstärke
  ShellyHT_Wohnzimmer_Signalstarke: 'ShellyHT_Wohnzimmer_Signalstarke',
  // Speis
  Speis: 'Speis',
  // Spotify
  Spotify: 'Spotify',
  // Active Device Name
  Spotify_Active_Device_Name: 'Spotify_Active_Device_Name',
  // Active Device Shuffle
  Spotify_Active_Device_Shuffle: 'Spotify_Active_Device_Shuffle',
  // Active Devices
  Spotify_Active_Devices: 'Spotify_Active_Devices',
  // Album Name
  Spotify_Album_Name: 'Spotify_Album_Name',
  // Album Image
  Spotify_AlbumImage: 'Spotify_AlbumImage',
  // Album Image
  Spotify_AlbumImageUrl: 'Spotify_AlbumImageUrl',
  // Fernbedienung
  Spotify_Fernbedienung: 'Spotify_Fernbedienung',
  // Künstler
  Spotify_Kunstler: 'Spotify_Kunstler',
  // Lautstärke
  Spotify_Lautstarke: 'Spotify_Lautstarke',
  // Playlist Name
  Spotify_Playlist_Name: 'Spotify_Playlist_Name',
  // Playlists
  Spotify_Playlists: 'Spotify_Playlists',
  // Repeat Mode
  Spotify_Repeat_Mode: 'Spotify_Repeat_Mode',
  // Titel
  Spotify_Titel: 'Spotify_Titel',
  // Track Duration
  Spotify_Track_Duration: 'Spotify_Track_Duration',
  // Track Progress
  Spotify_Track_Progress: 'Spotify_Track_Progress',
  // Group
  Technikraum: 'Technikraum',
  // Group
  Terrasse: 'Terrasse',
  // TX-NR636
  TXNR636: 'TXNR636',
  // Eingabequelle
  TXNR636_Zone1_Input: 'TXNR636_Zone1_Input',
  // Stumm schalten
  TXNR636_Zone1_Mute: 'TXNR636_Zone1_Mute',
  // Betrieb
  TXNR636_Zone1_Power: 'TXNR636_Zone1_Power',
  // Lautstärke
  TXNR636_Zone1_Volume: 'TXNR636_Zone1_Volume',
  // Vorraum & Garderobe
  Vorraum: 'Vorraum',
  // Group
  Waschraum: 'Waschraum',
  // WC
  WC: 'WC',
  // WC Keller
  WCKeller: 'WCKeller',
  // Wohnzimmer
  Wohnzimmer: 'Wohnzimmer',
  // Zimmer Ylvie
  Ylvie: 'Ylvie',
} as const

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Union type of all item names
export type ItemName = 
  | 'Anschlussraum'
  | 'Astro_Sun_Data_Sonnenphase'
  | 'Bad'
  | 'Buero'
  | 'BueroEG'
  | 'DA1_Licht_Gang'
  | 'DA1_Licht_Vorraum__Garderobe'
  | 'EG'
  | 'EG_Humidities'
  | 'EG_Temperatures'
  | 'Einfahrt'
  | 'Essen'
  | 'Esstisch'
  | 'EVCC'
  | 'EVCC_Available_Version'
  | 'EVCC_Charged_Energy'
  | 'EVCC_Charger_Feature_Heating'
  | 'EVCC_Charger_Feature_Integrated_Device'
  | 'EVCC_Charging_Active_Phases'
  | 'EVCC_Charging_Current'
  | 'EVCC_Charging_Duration'
  | 'EVCC_Charging_Enabled'
  | 'EVCC_Charging_Enabled_Phases'
  | 'EVCC_Charging_Limit_Energy'
  | 'EVCC_Charging_Limit_SoC'
  | 'EVCC_Charging_max_Current'
  | 'EVCC_Charging_min_Current'
  | 'EVCC_Charging_Mode'
  | 'EVCC_Charging_Power'
  | 'EVCC_Charging_Remaining_Duration'
  | 'EVCC_Charging_Remaining_Energy'
  | 'EVCC_Charging_State'
  | 'EVCC_Effective_Charging_Limit'
  | 'EVCC_Grid_Power'
  | 'EVCC_Home_Power'
  | 'EVCC_Loadpoint_Title'
  | 'EVCC_PV_Power'
  | 'EVCC_Vehicle_Capacity'
  | 'EVCC_Vehicle_Charging_Limit_SoC'
  | 'EVCC_Vehicle_Connected'
  | 'EVCC_Vehicle_Connected_Duration'
  | 'EVCC_Vehicle_Data_Access'
  | 'EVCC_Vehicle_Min_SoC'
  | 'EVCC_Vehicle_Name'
  | 'EVCC_Vehicle_Odometer'
  | 'EVCC_Vehicle_Plan_Enabled'
  | 'EVCC_Vehicle_Plan_SoC'
  | 'EVCC_Vehicle_Plan_Time'
  | 'EVCC_Vehicle_Range'
  | 'EVCC_Vehicle_SoC'
  | 'EVCC_Vehicle_Title'
  | 'EVCC_Version'
  | 'Fitnessraum'
  | 'Gang'
  | 'Garage'
  | 'GoeCharger'
  | 'GoeCharger_Access_Configuration'
  | 'GoeCharger_Allow_Charging'
  | 'GoeCharger_Awatttar_Max_Price'
  | 'GoeCharger_Cable_Encoding'
  | 'GoeCharger_Current_L1'
  | 'GoeCharger_Current_L2'
  | 'GoeCharger_Current_L3'
  | 'GoeCharger_Current_Session_Charge_Energy_Limit'
  | 'GoeCharger_Current_Session_Charged_Energy'
  | 'GoeCharger_Error_Code'
  | 'GoeCharger_Firmware'
  | 'GoeCharger_Force_state'
  | 'GoeCharger_Maximum_Current'
  | 'GoeCharger_Maximum_Current_Temporary'
  | 'GoeCharger_Phases'
  | 'GoeCharger_Power_All'
  | 'GoeCharger_Power_L1'
  | 'GoeCharger_Power_L2'
  | 'GoeCharger_Power_L3'
  | 'GoeCharger_PWM_signal_status'
  | 'GoeCharger_Temperature_circuit_board'
  | 'GoeCharger_Temperature_type_2_port'
  | 'GoeCharger_Total_Charged_Energy'
  | 'GoeCharger_Transaction'
  | 'GoeCharger_Voltage_L1'
  | 'GoeCharger_Voltage_L2'
  | 'GoeCharger_Voltage_L3'
  | 'Hauer'
  | 'Healthy_Home_Coach'
  | 'Healthy_Home_Coach_CO2'
  | 'Healthy_Home_Coach_Health_Index'
  | 'Healthy_Home_Coach_Innentemperatur'
  | 'Healthy_Home_Coach_Luftfeuchtigkeit'
  | 'Healthy_Home_Coach_Signalstarke'
  | 'iPad_Air_2024_Ylvie'
  | 'iPad_Air_2024_Ylvie_AccessPoint'
  | 'iPad_Air_2024_Ylvie_Drahtloses_Netzwerk'
  | 'iPad_Air_2024_Ylvie_Empfangene_Signalstarke'
  | 'iPad_Air_2024_Ylvie_Experience'
  | 'iPad_Air_2024_Ylvie_Hostname'
  | 'iPad_Air_2024_Ylvie_IP_Addresse'
  | 'iPad_Air_2024_Ylvie_MAC_Adresse'
  | 'iPad_Air_2024_Ylvie_Name'
  | 'iPad_Air_2024_Ylvie_Online'
  | 'iPad_Air_2024_Ylvie_Online_seit'
  | 'iPad_Air_2024_Ylvie_Zuletzt_gesehen'
  | 'iPhone_12_Ylvie'
  | 'iPhone_12_Ylvie_AccessPoint'
  | 'iPhone_12_Ylvie_Drahtloses_Netzwerk'
  | 'iPhone_12_Ylvie_Empfangene_Signalstarke'
  | 'iPhone_12_Ylvie_Experience'
  | 'iPhone_12_Ylvie_Hostname'
  | 'iPhone_12_Ylvie_IP_Addresse'
  | 'iPhone_12_Ylvie_MAC_Adresse'
  | 'iPhone_12_Ylvie_Online'
  | 'iPhone_12_Ylvie_Online_seit'
  | 'iPhone_12_Ylvie_Zuletzt_gesehen'
  | 'iPhone_13_Nevia'
  | 'iPhone_13_Nevia_AccessPoint'
  | 'iPhone_13_Nevia_Drahtloses_Netzwerk'
  | 'iPhone_13_Nevia_Empfangene_Signalstarke'
  | 'iPhone_13_Nevia_Experience'
  | 'iPhone_13_Nevia_Hostname'
  | 'iPhone_13_Nevia_IP_Addresse'
  | 'iPhone_13_Nevia_MAC_Adresse'
  | 'iPhone_13_Nevia_Name'
  | 'iPhone_13_Nevia_Online'
  | 'iPhone_13_Nevia_Online_seit'
  | 'iPhone_13_Nevia_Zuletzt_gesehen'
  | 'iPhone_16_Pro_Michi'
  | 'iPhone_16_Pro_Michi_AccessPoint'
  | 'iPhone_16_Pro_Michi_Drahtloses_Netzwerk'
  | 'iPhone_16_Pro_Michi_Empfangene_Signalstarke'
  | 'iPhone_16_Pro_Michi_Experience'
  | 'iPhone_16_Pro_Michi_Hostname'
  | 'iPhone_16_Pro_Michi_IP_Addresse'
  | 'iPhone_16_Pro_Michi_MAC_Adresse'
  | 'iPhone_16_Pro_Michi_Name'
  | 'iPhone_16_Pro_Michi_Online'
  | 'iPhone_16_Pro_Michi_Online_seit'
  | 'iPhone_16_Pro_Michi_Zuletzt_gesehen'
  | 'Keller'
  | 'KNX_2fach_Taster_Buro_Keller_Stiege_Multimedia'
  | 'KNX_DA1_Licht_WC'
  | 'KNX_Helios_KWRL'
  | 'KNX_Helios_KWRL_Ist_Prozent'
  | 'KNX_Helios_KWRL_Ist_Stufe'
  | 'KNX_Helios_KWRL_Restlaufzeit_Filter'
  | 'KNX_Helios_KWRL_Soll_Prozent'
  | 'KNX_Helios_KWRL_Soll_Stufe_'
  | 'KNX_Helios_KWRL_Temperatur_Abluft'
  | 'KNX_Helios_KWRL_Temperatur_Aussenluft'
  | 'KNX_Helios_KWRL_Temperatur_Fortluft'
  | 'KNX_Helios_KWRL_Temperatur_Zuluft'
  | 'KNX_Helios_ManualMode'
  | 'KNX_Hormann_Garagentor'
  | 'KNX_Hormann_Garagentor_Garagentor'
  | 'KNX_Hormann_Garagentor_Status_Tor_geschlossen'
  | 'KNX_Hormann_Garagentor_Status_Tor_offen'
  | 'KNX_JA1_Raffstore_Esstisch'
  | 'KNX_JA1_Raffstore_Wohnzimmer'
  | 'KNX_JA1_Raffstore_Wohnzimmer_Strasse'
  | 'KNX_JA2_Rollladen_Michi__Sabrina'
  | 'KNX_JA2_Rollladen_Nevia'
  | 'KNX_JA2_Rollladen_Schrankraum'
  | 'KNX_JA2_Rollladen_Ylvie'
  | 'KNX_RA1_CH01'
  | 'KNX_RA1_CH04'
  | 'KNX_RA1_Markise_Terrasse'
  | 'KNX_RA1_Rollladen_Buro'
  | 'KNX_SAH1_Stromerkennung_Licht_Buro'
  | 'KNX_SAH1_Stromerkennung_Licht_Nevia'
  | 'KNX_SAH1_Stromerkennung_Licht_Schlafzimmer'
  | 'KNX_SAH1_Stromerkennung_Licht_Schrankraum'
  | 'KNX_SAH1_Stromerkennung_Licht_Ylvie'
  | 'KNX_SAH2_Licht_Einfahrt'
  | 'KNX_SAH2_Licht_Eingang'
  | 'KNX_SAH2_Licht_Garage'
  | 'KNX_SAH2_Licht_Keller_Anschlussraum'
  | 'KNX_SAH2_Licht_Keller_Gang'
  | 'KNX_SAH2_Licht_Terrasse_Saulen'
  | 'KNX_SAH2_Licht_Terrasse_Wand'
  | 'KNX_SAH2_Licht_WC_Keller'
  | 'KNX_SAH3_Licht_Bad_Dusche'
  | 'KNX_SAH3_Licht_Bad_Spiegel'
  | 'KNX_SAH3_Licht_Fitness'
  | 'KNX_SAH3_Licht_Schleuse'
  | 'KNX_SAH3_Licht_Serverraum'
  | 'KNX_SAH3_Licht_Technikraum'
  | 'KNX_SAH3_Licht_Waschraum'
  | 'KNX_State_Flag_Item_Late'
  | 'KNX_Status_Flags_KNX_Status_Nacht'
  | 'KNX_Wetterstation_Aussentemperatur'
  | 'KNX_Wetterstation_Dammerschwelle_uberschritten'
  | 'KNX_Wetterstation_Helligkeit'
  | 'KNX_Wetterstation_Regen'
  | 'KNX_Wetterstation_Windgeschwindigkeit'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Frequency'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Day'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Month'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Total'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Year'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Cos_Phi'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_DC_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit_Relative'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_MC_Errors'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Errors'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Warnings'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SFH_Errors'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Uptime'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Day'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Month'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Total'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Year'
  | 'Kueche'
  | 'Mobile_Devices_Presence'
  | 'Nevia'
  | 'SabrinaMichi'
  | 'SAH1_Stromerkennung_Licht_Esstisch'
  | 'SAH1_Stromerkennung_Licht_Speis'
  | 'SAH2_Licht_Keller_Buro'
  | 'SAH3_Licht_Couch'
  | 'SAH3_Licht_TV'
  | 'Samsung_Galaxy_A55_Sabrina'
  | 'Samsung_Galaxy_A55_Sabrina_AccessPoint'
  | 'Samsung_Galaxy_A55_Sabrina_Drahtloses_Netzwerk'
  | 'Samsung_Galaxy_A55_Sabrina_Empfangene_Signalstarke'
  | 'Samsung_Galaxy_A55_Sabrina_Experience'
  | 'Samsung_Galaxy_A55_Sabrina_Hostname'
  | 'Samsung_Galaxy_A55_Sabrina_IP_Addresse'
  | 'Samsung_Galaxy_A55_Sabrina_MAC_Adresse'
  | 'Samsung_Galaxy_A55_Sabrina_Name'
  | 'Samsung_Galaxy_A55_Sabrina_Online'
  | 'Samsung_Galaxy_A55_Sabrina_Online_seit'
  | 'Samsung_Galaxy_A55_Sabrina_Zuletzt_gesehen'
  | 'Samsung_TV_Keller'
  | 'Samsung_TV_Keller_Art_Mode'
  | 'Samsung_TV_Keller_Artwork_Orientation'
  | 'Samsung_TV_Keller_Kanal'
  | 'Samsung_TV_Keller_Kanalnummer'
  | 'Samsung_TV_Keller_Lautstarke'
  | 'Samsung_TV_Keller_Power'
  | 'Samsung_TV_Keller_Source'
  | 'Samsung_TV_Keller_Stumm_schalten'
  | 'Samsung_TV_Keller_Tastendruck'
  | 'Samsung_TV_Keller_Titel'
  | 'Samsung_TV_Wohnzimmer'
  | 'Samsung_TV_Wohnzimmer_Art_Mode'
  | 'Samsung_TV_Wohnzimmer_Artwork_Orientation'
  | 'Samsung_TV_Wohnzimmer_Kanal'
  | 'Samsung_TV_Wohnzimmer_Kanalnummer'
  | 'Samsung_TV_Wohnzimmer_Lautstarke'
  | 'Samsung_TV_Wohnzimmer_Power'
  | 'Samsung_TV_Wohnzimmer_Source'
  | 'Samsung_TV_Wohnzimmer_Stumm_schalten'
  | 'Samsung_TV_Wohnzimmer_Tastendruck'
  | 'Samsung_TV_Wohnzimmer_Titel'
  | 'Schleuse'
  | 'Schrankraum'
  | 'Serverraum'
  | 'SHA1_Stromerkennung_Licht_Kuche'
  | 'Shelly_Color_Bulbs_Esstisch'
  | 'Shelly_Color_Bulbs_Esstisch_White'
  | 'Shelly_HT_Bad'
  | 'Shelly_HT_Bad_Atmospheric_Humidity'
  | 'Shelly_HT_Bad_Battery_Level'
  | 'Shelly_HT_Bad_Indoor_Temperature'
  | 'Shelly_HT_Bad_Letzter_Fehler'
  | 'Shelly_HT_Bad_Low_Battery'
  | 'Shelly_HT_Bad_Signalstarke'
  | 'Shelly_Plug_Buro_Keller'
  | 'Shelly_Plug_Buro_Keller_Betrieb'
  | 'Shelly_Plug_Buro_Keller_BetriebsLED_aus'
  | 'Shelly_Plug_Buro_Keller_Gesamtverbrauch'
  | 'Shelly_Plug_Buro_Keller_Indoor_Temperature'
  | 'Shelly_Plug_Buro_Keller_Signalstarke'
  | 'Shelly_Plug_Buro_Keller_StatusLED_aus'
  | 'Shelly_Plug_Buro_Keller_Stromverbrauch'
  | 'Shelly_Plug_Speis'
  | 'Shelly_Plug_Speis_Betrieb'
  | 'Shelly_Plug_Speis_BetriebsLED_aus'
  | 'Shelly_Plug_Speis_Gesamtverbrauch'
  | 'Shelly_Plug_Speis_Indoor_Temperature'
  | 'Shelly_Plug_Speis_Signalstarke'
  | 'Shelly_Plug_Speis_StatusLED_aus'
  | 'Shelly_Plug_Speis_Stromverbrauch'
  | 'Shelly_Plug_Wohnzimmer'
  | 'Shelly_Plug_Wohnzimmer_Betrieb'
  | 'Shelly_Plug_Wohnzimmer_Gesamtverbrauch'
  | 'Shelly_Plug_Wohnzimmer_Signalstarke'
  | 'Shelly_Plug_Wohnzimmer_StatusLED_aus'
  | 'Shelly_Plug_Wohnzimmer_Stromverbrauch'
  | 'Shelly_RGBW_PM_Buro_Keller'
  | 'Shelly_RGBW_PM_Buro_Keller_AutoANTimer'
  | 'Shelly_RGBW_PM_Buro_Keller_AutoAUS_Timer'
  | 'Shelly_RGBW_PM_Buro_Keller_Blau'
  | 'Shelly_RGBW_PM_Buro_Keller_EingangTaste'
  | 'Shelly_RGBW_PM_Buro_Keller_Farbe'
  | 'Shelly_RGBW_PM_Buro_Keller_Firmwareaktualisierung_verfugbar'
  | 'Shelly_RGBW_PM_Buro_Keller_Grun'
  | 'Shelly_RGBW_PM_Buro_Keller_Helligkeit'
  | 'Shelly_RGBW_PM_Buro_Keller_Laufzeit'
  | 'Shelly_RGBW_PM_Buro_Keller_Letzte_Aktivitat'
  | 'Shelly_RGBW_PM_Buro_Keller_Rot'
  | 'Shelly_RGBW_PM_Buro_Keller_Signalstarke'
  | 'Shelly_RGBW_PM_Buro_Keller_Volltonfarbe'
  | 'Shelly_RGBW_PM_Buro_Keller_Weiss'
  | 'ShellyHT_Wohnzimmer'
  | 'ShellyHT_Wohnzimmer_Atmospheric_Humidity'
  | 'ShellyHT_Wohnzimmer_Battery_Level'
  | 'ShellyHT_Wohnzimmer_Indoor_Temperature'
  | 'ShellyHT_Wohnzimmer_Letzter_Fehler'
  | 'ShellyHT_Wohnzimmer_Low_Battery'
  | 'ShellyHT_Wohnzimmer_Signalstarke'
  | 'Speis'
  | 'Spotify'
  | 'Spotify_Active_Device_Name'
  | 'Spotify_Active_Device_Shuffle'
  | 'Spotify_Active_Devices'
  | 'Spotify_Album_Name'
  | 'Spotify_AlbumImage'
  | 'Spotify_AlbumImageUrl'
  | 'Spotify_Fernbedienung'
  | 'Spotify_Kunstler'
  | 'Spotify_Lautstarke'
  | 'Spotify_Playlist_Name'
  | 'Spotify_Playlists'
  | 'Spotify_Repeat_Mode'
  | 'Spotify_Titel'
  | 'Spotify_Track_Duration'
  | 'Spotify_Track_Progress'
  | 'Technikraum'
  | 'Terrasse'
  | 'TXNR636'
  | 'TXNR636_Zone1_Input'
  | 'TXNR636_Zone1_Mute'
  | 'TXNR636_Zone1_Power'
  | 'TXNR636_Zone1_Volume'
  | 'Vorraum'
  | 'Waschraum'
  | 'WC'
  | 'WCKeller'
  | 'Wohnzimmer'
  | 'Ylvie'

// Equipment item names union type
export type EquipmentItemName = 
  | 'EVCC'
  | 'GoeCharger'
  | 'Healthy_Home_Coach'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery'
  | 'Shelly_HT_Bad'
  | 'Shelly_RGBW_PM_Buro_Keller'
  | 'iPad_Air_2024_Ylvie'
  | 'iPhone_12_Ylvie'
  | 'iPhone_13_Nevia'
  | 'iPhone_16_Pro_Michi'
  | 'Samsung_Galaxy_A55_Sabrina'
  | 'KNX_Helios_KWRL'
  | 'KNX_Hormann_Garagentor'
  | 'Samsung_TV_Keller'
  | 'Samsung_TV_Wohnzimmer'
  | 'Spotify'
  | 'TXNR636'
  | 'Shelly_Plug_Buro_Keller'
  | 'Shelly_Plug_Speis'
  | 'Shelly_Plug_Wohnzimmer'
  | 'ShellyHT_Wohnzimmer'

// Group item names union type
export type GroupItemName = 
  | 'EG_Humidities'

// Location item names union type
export type LocationItemName = 
  | 'Anschlussraum'
  | 'Bad'
  | 'Buero'
  | 'BueroEG'
  | 'Einfahrt'
  | 'Essen'
  | 'Esstisch'
  | 'Fitnessraum'
  | 'Gang'
  | 'Garage'
  | 'Hauer'
  | 'Nevia'
  | 'SabrinaMichi'
  | 'Schleuse'
  | 'Schrankraum'
  | 'Serverraum'
  | 'Shelly_Color_Bulbs_Esstisch'
  | 'Shelly_Color_Bulbs_Esstisch_White'
  | 'Speis'
  | 'Technikraum'
  | 'Terrasse'
  | 'Waschraum'
  | 'WC'
  | 'WCKeller'
  | 'Wohnzimmer'
  | 'Ylvie'
  | 'EG'
  | 'Keller'
  | 'Kueche'
  | 'Vorraum'

// Point item names union type
export type PointItemName = 
  | 'Astro_Sun_Data_Sonnenphase'
  | 'EVCC_Charging_State'
  | 'EVCC_Vehicle_Connected'
  | 'Healthy_Home_Coach_Health_Index'
  | 'KNX_Helios_KWRL_Ist_Prozent'
  | 'KNX_Helios_KWRL_Ist_Stufe'
  | 'KNX_Wetterstation_Aussentemperatur'
  | 'KNX_Wetterstation_Helligkeit'
  | 'Mobile_Devices_Presence'
  | 'Shelly_HT_Bad_Low_Battery'
  | 'Shelly_RGBW_PM_Buro_Keller_EingangTaste'
  | 'ShellyHT_Wohnzimmer_Low_Battery'
  | 'Spotify_AlbumImage'
  | 'Spotify_AlbumImageUrl'
  | 'Spotify_Kunstler'
  | 'Spotify_Titel'
  | 'Spotify_Track_Duration'
  | 'Spotify_Track_Progress'
  | 'DA1_Licht_Gang'
  | 'DA1_Licht_Vorraum__Garderobe'
  | 'KNX_DA1_Licht_WC'
  | 'KNX_Helios_KWRL_Soll_Prozent'
  | 'KNX_Helios_KWRL_Soll_Stufe_'
  | 'KNX_Helios_ManualMode'
  | 'EG_Temperatures'
  | 'EVCC_Charged_Energy'
  | 'EVCC_Charging_Current'
  | 'EVCC_Charging_Power'
  | 'EVCC_Charging_Remaining_Energy'
  | 'EVCC_Grid_Power'
  | 'EVCC_Home_Power'
  | 'EVCC_PV_Power'
  | 'EVCC_Vehicle_Capacity'
  | 'GoeCharger_Current_L1'
  | 'GoeCharger_Current_L2'
  | 'GoeCharger_Current_L3'
  | 'GoeCharger_Current_Session_Charged_Energy'
  | 'GoeCharger_Power_All'
  | 'GoeCharger_Power_L1'
  | 'GoeCharger_Power_L2'
  | 'GoeCharger_Power_L3'
  | 'GoeCharger_Temperature_circuit_board'
  | 'GoeCharger_Temperature_type_2_port'
  | 'GoeCharger_Total_Charged_Energy'
  | 'GoeCharger_Voltage_L1'
  | 'GoeCharger_Voltage_L2'
  | 'GoeCharger_Voltage_L3'
  | 'Healthy_Home_Coach_CO2'
  | 'Healthy_Home_Coach_Innentemperatur'
  | 'Healthy_Home_Coach_Luftfeuchtigkeit'
  | 'Healthy_Home_Coach_Signalstarke'
  | 'iPad_Air_2024_Ylvie_Empfangene_Signalstarke'
  | 'iPhone_12_Ylvie_Empfangene_Signalstarke'
  | 'iPhone_13_Nevia_Empfangene_Signalstarke'
  | 'iPhone_16_Pro_Michi_Empfangene_Signalstarke'
  | 'KNX_Helios_KWRL_Temperatur_Abluft'
  | 'KNX_Helios_KWRL_Temperatur_Aussenluft'
  | 'KNX_Helios_KWRL_Temperatur_Fortluft'
  | 'KNX_Helios_KWRL_Temperatur_Zuluft'
  | 'KNX_Wetterstation_Windgeschwindigkeit'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_DC_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Amperage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Power'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Voltage'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Day'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Month'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Total'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Year'
  | 'Samsung_Galaxy_A55_Sabrina_Empfangene_Signalstarke'
  | 'Shelly_HT_Bad_Atmospheric_Humidity'
  | 'Shelly_HT_Bad_Battery_Level'
  | 'Shelly_HT_Bad_Indoor_Temperature'
  | 'Shelly_HT_Bad_Signalstarke'
  | 'Shelly_Plug_Buro_Keller_Gesamtverbrauch'
  | 'Shelly_Plug_Buro_Keller_Indoor_Temperature'
  | 'Shelly_Plug_Buro_Keller_Signalstarke'
  | 'Shelly_Plug_Buro_Keller_Stromverbrauch'
  | 'Shelly_Plug_Speis_Gesamtverbrauch'
  | 'Shelly_Plug_Speis_Indoor_Temperature'
  | 'Shelly_Plug_Speis_Signalstarke'
  | 'Shelly_Plug_Speis_Stromverbrauch'
  | 'Shelly_Plug_Wohnzimmer_Gesamtverbrauch'
  | 'Shelly_Plug_Wohnzimmer_Signalstarke'
  | 'Shelly_Plug_Wohnzimmer_Stromverbrauch'
  | 'Shelly_RGBW_PM_Buro_Keller_Signalstarke'
  | 'ShellyHT_Wohnzimmer_Atmospheric_Humidity'
  | 'ShellyHT_Wohnzimmer_Battery_Level'
  | 'ShellyHT_Wohnzimmer_Indoor_Temperature'
  | 'ShellyHT_Wohnzimmer_Signalstarke'
  | 'EVCC_Available_Version'
  | 'EVCC_Charger_Feature_Heating'
  | 'EVCC_Charger_Feature_Integrated_Device'
  | 'EVCC_Charging_Active_Phases'
  | 'EVCC_Charging_Duration'
  | 'EVCC_Charging_Enabled'
  | 'EVCC_Charging_Enabled_Phases'
  | 'EVCC_Charging_Limit_Energy'
  | 'EVCC_Charging_Limit_SoC'
  | 'EVCC_Charging_Mode'
  | 'EVCC_Charging_Remaining_Duration'
  | 'EVCC_Effective_Charging_Limit'
  | 'EVCC_Loadpoint_Title'
  | 'EVCC_Vehicle_Charging_Limit_SoC'
  | 'EVCC_Vehicle_Connected_Duration'
  | 'EVCC_Vehicle_Data_Access'
  | 'EVCC_Vehicle_Min_SoC'
  | 'EVCC_Vehicle_Name'
  | 'EVCC_Vehicle_Odometer'
  | 'EVCC_Vehicle_Plan_Enabled'
  | 'EVCC_Vehicle_Plan_SoC'
  | 'EVCC_Vehicle_Plan_Time'
  | 'EVCC_Vehicle_Range'
  | 'EVCC_Vehicle_SoC'
  | 'EVCC_Vehicle_Title'
  | 'EVCC_Version'
  | 'GoeCharger_Access_Configuration'
  | 'GoeCharger_Allow_Charging'
  | 'GoeCharger_Awatttar_Max_Price'
  | 'GoeCharger_Cable_Encoding'
  | 'GoeCharger_Error_Code'
  | 'GoeCharger_Firmware'
  | 'GoeCharger_Force_state'
  | 'GoeCharger_Phases'
  | 'GoeCharger_PWM_signal_status'
  | 'GoeCharger_Transaction'
  | 'iPad_Air_2024_Ylvie_AccessPoint'
  | 'iPad_Air_2024_Ylvie_Drahtloses_Netzwerk'
  | 'iPad_Air_2024_Ylvie_Experience'
  | 'iPad_Air_2024_Ylvie_Hostname'
  | 'iPad_Air_2024_Ylvie_IP_Addresse'
  | 'iPad_Air_2024_Ylvie_MAC_Adresse'
  | 'iPad_Air_2024_Ylvie_Name'
  | 'iPad_Air_2024_Ylvie_Online'
  | 'iPad_Air_2024_Ylvie_Online_seit'
  | 'iPad_Air_2024_Ylvie_Zuletzt_gesehen'
  | 'iPhone_12_Ylvie_AccessPoint'
  | 'iPhone_12_Ylvie_Drahtloses_Netzwerk'
  | 'iPhone_12_Ylvie_Experience'
  | 'iPhone_12_Ylvie_Hostname'
  | 'iPhone_12_Ylvie_IP_Addresse'
  | 'iPhone_12_Ylvie_MAC_Adresse'
  | 'iPhone_12_Ylvie_Online'
  | 'iPhone_12_Ylvie_Online_seit'
  | 'iPhone_12_Ylvie_Zuletzt_gesehen'
  | 'iPhone_13_Nevia_AccessPoint'
  | 'iPhone_13_Nevia_Drahtloses_Netzwerk'
  | 'iPhone_13_Nevia_Experience'
  | 'iPhone_13_Nevia_Hostname'
  | 'iPhone_13_Nevia_IP_Addresse'
  | 'iPhone_13_Nevia_MAC_Adresse'
  | 'iPhone_13_Nevia_Name'
  | 'iPhone_13_Nevia_Online'
  | 'iPhone_13_Nevia_Online_seit'
  | 'iPhone_13_Nevia_Zuletzt_gesehen'
  | 'iPhone_16_Pro_Michi_AccessPoint'
  | 'iPhone_16_Pro_Michi_Drahtloses_Netzwerk'
  | 'iPhone_16_Pro_Michi_Experience'
  | 'iPhone_16_Pro_Michi_Hostname'
  | 'iPhone_16_Pro_Michi_IP_Addresse'
  | 'iPhone_16_Pro_Michi_MAC_Adresse'
  | 'iPhone_16_Pro_Michi_Name'
  | 'iPhone_16_Pro_Michi_Online'
  | 'iPhone_16_Pro_Michi_Online_seit'
  | 'iPhone_16_Pro_Michi_Zuletzt_gesehen'
  | 'KNX_Helios_KWRL_Restlaufzeit_Filter'
  | 'KNX_Hormann_Garagentor_Status_Tor_geschlossen'
  | 'KNX_Hormann_Garagentor_Status_Tor_offen'
  | 'KNX_SAH3_Licht_Waschraum'
  | 'KNX_Wetterstation_Dammerschwelle_uberschritten'
  | 'KNX_Wetterstation_Regen'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Frequency'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Day'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Month'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Total'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Year'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Cos_Phi'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit_Relative'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_MC_Errors'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Errors'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Warnings'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SFH_Errors'
  | 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Uptime'
  | 'Samsung_Galaxy_A55_Sabrina_AccessPoint'
  | 'Samsung_Galaxy_A55_Sabrina_Drahtloses_Netzwerk'
  | 'Samsung_Galaxy_A55_Sabrina_Experience'
  | 'Samsung_Galaxy_A55_Sabrina_Hostname'
  | 'Samsung_Galaxy_A55_Sabrina_IP_Addresse'
  | 'Samsung_Galaxy_A55_Sabrina_MAC_Adresse'
  | 'Samsung_Galaxy_A55_Sabrina_Name'
  | 'Samsung_Galaxy_A55_Sabrina_Online'
  | 'Samsung_Galaxy_A55_Sabrina_Online_seit'
  | 'Samsung_Galaxy_A55_Sabrina_Zuletzt_gesehen'
  | 'Samsung_TV_Keller_Art_Mode'
  | 'Samsung_TV_Keller_Artwork_Orientation'
  | 'Samsung_TV_Keller_Kanal'
  | 'Samsung_TV_Keller_Kanalnummer'
  | 'Samsung_TV_Keller_Lautstarke'
  | 'Samsung_TV_Keller_Power'
  | 'Samsung_TV_Keller_Source'
  | 'Samsung_TV_Keller_Stumm_schalten'
  | 'Samsung_TV_Keller_Tastendruck'
  | 'Samsung_TV_Keller_Titel'
  | 'Samsung_TV_Wohnzimmer_Art_Mode'
  | 'Samsung_TV_Wohnzimmer_Artwork_Orientation'
  | 'Samsung_TV_Wohnzimmer_Kanal'
  | 'Samsung_TV_Wohnzimmer_Kanalnummer'
  | 'Samsung_TV_Wohnzimmer_Lautstarke'
  | 'Samsung_TV_Wohnzimmer_Power'
  | 'Samsung_TV_Wohnzimmer_Source'
  | 'Samsung_TV_Wohnzimmer_Stumm_schalten'
  | 'Samsung_TV_Wohnzimmer_Tastendruck'
  | 'Samsung_TV_Wohnzimmer_Titel'
  | 'Shelly_HT_Bad_Letzter_Fehler'
  | 'Shelly_Plug_Buro_Keller_BetriebsLED_aus'
  | 'Shelly_Plug_Buro_Keller_StatusLED_aus'
  | 'Shelly_Plug_Speis_BetriebsLED_aus'
  | 'Shelly_Plug_Speis_StatusLED_aus'
  | 'Shelly_Plug_Wohnzimmer_StatusLED_aus'
  | 'Shelly_RGBW_PM_Buro_Keller_AutoANTimer'
  | 'Shelly_RGBW_PM_Buro_Keller_AutoAUS_Timer'
  | 'Shelly_RGBW_PM_Buro_Keller_Blau'
  | 'Shelly_RGBW_PM_Buro_Keller_Firmwareaktualisierung_verfugbar'
  | 'Shelly_RGBW_PM_Buro_Keller_Grun'
  | 'Shelly_RGBW_PM_Buro_Keller_Helligkeit'
  | 'Shelly_RGBW_PM_Buro_Keller_Laufzeit'
  | 'Shelly_RGBW_PM_Buro_Keller_Letzte_Aktivitat'
  | 'Shelly_RGBW_PM_Buro_Keller_Rot'
  | 'Shelly_RGBW_PM_Buro_Keller_Volltonfarbe'
  | 'Shelly_RGBW_PM_Buro_Keller_Weiss'
  | 'ShellyHT_Wohnzimmer_Letzter_Fehler'
  | 'Spotify_Album_Name'
  | 'Spotify_Playlist_Name'
  | 'TXNR636_Zone1_Input'
  | 'TXNR636_Zone1_Mute'
  | 'TXNR636_Zone1_Power'
  | 'TXNR636_Zone1_Volume'
  | 'EVCC_Charging_max_Current'
  | 'EVCC_Charging_min_Current'
  | 'GoeCharger_Current_Session_Charge_Energy_Limit'
  | 'GoeCharger_Maximum_Current'
  | 'GoeCharger_Maximum_Current_Temporary'
  | 'KNX_2fach_Taster_Buro_Keller_Stiege_Multimedia'
  | 'KNX_Hormann_Garagentor_Garagentor'
  | 'KNX_JA1_Raffstore_Esstisch'
  | 'KNX_JA1_Raffstore_Wohnzimmer'
  | 'KNX_JA1_Raffstore_Wohnzimmer_Strasse'
  | 'KNX_JA2_Rollladen_Michi__Sabrina'
  | 'KNX_JA2_Rollladen_Nevia'
  | 'KNX_JA2_Rollladen_Schrankraum'
  | 'KNX_JA2_Rollladen_Ylvie'
  | 'KNX_RA1_CH01'
  | 'KNX_RA1_CH04'
  | 'KNX_RA1_Markise_Terrasse'
  | 'KNX_RA1_Rollladen_Buro'
  | 'KNX_SAH1_Stromerkennung_Licht_Buro'
  | 'KNX_SAH1_Stromerkennung_Licht_Nevia'
  | 'KNX_SAH1_Stromerkennung_Licht_Schlafzimmer'
  | 'KNX_SAH1_Stromerkennung_Licht_Schrankraum'
  | 'KNX_SAH1_Stromerkennung_Licht_Ylvie'
  | 'KNX_SAH2_Licht_Einfahrt'
  | 'KNX_SAH2_Licht_Eingang'
  | 'KNX_SAH2_Licht_Garage'
  | 'KNX_SAH2_Licht_Keller_Anschlussraum'
  | 'KNX_SAH2_Licht_Keller_Gang'
  | 'KNX_SAH2_Licht_Terrasse_Saulen'
  | 'KNX_SAH2_Licht_Terrasse_Wand'
  | 'KNX_SAH2_Licht_WC_Keller'
  | 'KNX_SAH3_Licht_Bad_Dusche'
  | 'KNX_SAH3_Licht_Bad_Spiegel'
  | 'KNX_SAH3_Licht_Fitness'
  | 'KNX_SAH3_Licht_Schleuse'
  | 'KNX_SAH3_Licht_Serverraum'
  | 'KNX_SAH3_Licht_Technikraum'
  | 'KNX_State_Flag_Item_Late'
  | 'KNX_Status_Flags_KNX_Status_Nacht'
  | 'SAH1_Stromerkennung_Licht_Esstisch'
  | 'SAH1_Stromerkennung_Licht_Speis'
  | 'SAH2_Licht_Keller_Buro'
  | 'SAH3_Licht_Couch'
  | 'SAH3_Licht_TV'
  | 'SHA1_Stromerkennung_Licht_Kuche'
  | 'Shelly_Plug_Buro_Keller_Betrieb'
  | 'Shelly_Plug_Speis_Betrieb'
  | 'Shelly_Plug_Wohnzimmer_Betrieb'
  | 'Shelly_RGBW_PM_Buro_Keller_Farbe'
  | 'Spotify_Active_Device_Name'
  | 'Spotify_Active_Device_Shuffle'
  | 'Spotify_Active_Devices'
  | 'Spotify_Fernbedienung'
  | 'Spotify_Lautstarke'
  | 'Spotify_Playlists'
  | 'Spotify_Repeat_Mode'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Basic helper functions
export function getItemName(name: ItemName): string {
  return name
}

export function isValidItemName(name: string): name is ItemName {
  return Object.values(ITEMS).includes(name as ItemName)
}

// Get all items from a semantic domain
export function getAllItemsFromDomain(domain: Record<string, Record<string, string>>): string[] {
  return Object.values(domain)
    .flatMap(property => Object.values(property))
}

// Get items by semantic type and property
export function getItemsBySemanticType(): Record<string, Record<string, string[]>> {
  return {
    'Equipment': {
      'General': ['EVCC', 'GoeCharger', 'Healthy_Home_Coach', 'KOSTAL_PLENTICORE_Plus_100_no_Battery', 'Shelly_HT_Bad', 'Shelly_RGBW_PM_Buro_Keller'],
      'Computer': ['iPad_Air_2024_Ylvie'],
      'Smartphone': ['iPhone_12_Ylvie', 'iPhone_13_Nevia', 'iPhone_16_Pro_Michi', 'Samsung_Galaxy_A55_Sabrina'],
      'HVAC': ['KNX_Helios_KWRL'],
      'Door': ['KNX_Hormann_Garagentor'],
      'AudioVisual': ['Samsung_TV_Keller', 'Samsung_TV_Wohnzimmer', 'Spotify', 'TXNR636'],
      'PowerOutlet': ['Shelly_Plug_Buro_Keller', 'Shelly_Plug_Speis', 'Shelly_Plug_Wohnzimmer'],
      'Sensor': ['ShellyHT_Wohnzimmer'],
    },
    'Group': {
      'General': ['EG_Humidities'],
    },
    'Location': {
      'General': ['Anschlussraum', 'Bad', 'Buero', 'BueroEG', 'Einfahrt', 'Essen', 'Esstisch', 'Fitnessraum', 'Gang', 'Garage', 'Hauer', 'Nevia', 'SabrinaMichi', 'Schleuse', 'Schrankraum', 'Serverraum', 'Shelly_Color_Bulbs_Esstisch', 'Shelly_Color_Bulbs_Esstisch_White', 'Speis', 'Technikraum', 'Terrasse', 'Waschraum', 'WC', 'WCKeller', 'Wohnzimmer', 'Ylvie'],
      'Indoor': ['EG', 'Keller', 'Kueche', 'Vorraum'],
    },
    'Point': {
      'Status': ['Astro_Sun_Data_Sonnenphase', 'EVCC_Charging_State', 'EVCC_Vehicle_Connected', 'Healthy_Home_Coach_Health_Index', 'KNX_Helios_KWRL_Ist_Prozent', 'KNX_Helios_KWRL_Ist_Stufe', 'KNX_Wetterstation_Aussentemperatur', 'KNX_Wetterstation_Helligkeit', 'Mobile_Devices_Presence', 'Shelly_HT_Bad_Low_Battery', 'Shelly_RGBW_PM_Buro_Keller_EingangTaste', 'ShellyHT_Wohnzimmer_Low_Battery', 'Spotify_AlbumImage', 'Spotify_AlbumImageUrl', 'Spotify_Kunstler', 'Spotify_Titel', 'Spotify_Track_Duration', 'Spotify_Track_Progress'],
      'Setpoint': ['DA1_Licht_Gang', 'DA1_Licht_Vorraum__Garderobe', 'KNX_DA1_Licht_WC', 'KNX_Helios_KWRL_Soll_Prozent', 'KNX_Helios_KWRL_Soll_Stufe_', 'KNX_Helios_ManualMode'],
      'Measurement': ['EG_Temperatures', 'EVCC_Charged_Energy', 'EVCC_Charging_Current', 'EVCC_Charging_Power', 'EVCC_Charging_Remaining_Energy', 'EVCC_Grid_Power', 'EVCC_Home_Power', 'EVCC_PV_Power', 'EVCC_Vehicle_Capacity', 'GoeCharger_Current_L1', 'GoeCharger_Current_L2', 'GoeCharger_Current_L3', 'GoeCharger_Current_Session_Charged_Energy', 'GoeCharger_Power_All', 'GoeCharger_Power_L1', 'GoeCharger_Power_L2', 'GoeCharger_Power_L3', 'GoeCharger_Temperature_circuit_board', 'GoeCharger_Temperature_type_2_port', 'GoeCharger_Total_Charged_Energy', 'GoeCharger_Voltage_L1', 'GoeCharger_Voltage_L2', 'GoeCharger_Voltage_L3', 'Healthy_Home_Coach_CO2', 'Healthy_Home_Coach_Innentemperatur', 'Healthy_Home_Coach_Luftfeuchtigkeit', 'Healthy_Home_Coach_Signalstarke', 'iPad_Air_2024_Ylvie_Empfangene_Signalstarke', 'iPhone_12_Ylvie_Empfangene_Signalstarke', 'iPhone_13_Nevia_Empfangene_Signalstarke', 'iPhone_16_Pro_Michi_Empfangene_Signalstarke', 'KNX_Helios_KWRL_Temperatur_Abluft', 'KNX_Helios_KWRL_Temperatur_Aussenluft', 'KNX_Helios_KWRL_Temperatur_Fortluft', 'KNX_Helios_KWRL_Temperatur_Zuluft', 'KNX_Wetterstation_Windgeschwindigkeit', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_DC_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Amperage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P1_Voltage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Amperage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P2_Voltage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Amperage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_P3_Voltage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Amperage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str1_Voltage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Amperage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str2_Voltage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Amperage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Power', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_PV_Str3_Voltage', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Day', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Month', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Total', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Yield_Year', 'Samsung_Galaxy_A55_Sabrina_Empfangene_Signalstarke', 'Shelly_HT_Bad_Atmospheric_Humidity', 'Shelly_HT_Bad_Battery_Level', 'Shelly_HT_Bad_Indoor_Temperature', 'Shelly_HT_Bad_Signalstarke', 'Shelly_Plug_Buro_Keller_Gesamtverbrauch', 'Shelly_Plug_Buro_Keller_Indoor_Temperature', 'Shelly_Plug_Buro_Keller_Signalstarke', 'Shelly_Plug_Buro_Keller_Stromverbrauch', 'Shelly_Plug_Speis_Gesamtverbrauch', 'Shelly_Plug_Speis_Indoor_Temperature', 'Shelly_Plug_Speis_Signalstarke', 'Shelly_Plug_Speis_Stromverbrauch', 'Shelly_Plug_Wohnzimmer_Gesamtverbrauch', 'Shelly_Plug_Wohnzimmer_Signalstarke', 'Shelly_Plug_Wohnzimmer_Stromverbrauch', 'Shelly_RGBW_PM_Buro_Keller_Signalstarke', 'ShellyHT_Wohnzimmer_Atmospheric_Humidity', 'ShellyHT_Wohnzimmer_Battery_Level', 'ShellyHT_Wohnzimmer_Indoor_Temperature', 'ShellyHT_Wohnzimmer_Signalstarke'],
      'General': ['EVCC_Available_Version', 'EVCC_Charger_Feature_Heating', 'EVCC_Charger_Feature_Integrated_Device', 'EVCC_Charging_Active_Phases', 'EVCC_Charging_Duration', 'EVCC_Charging_Enabled', 'EVCC_Charging_Enabled_Phases', 'EVCC_Charging_Limit_Energy', 'EVCC_Charging_Limit_SoC', 'EVCC_Charging_Mode', 'EVCC_Charging_Remaining_Duration', 'EVCC_Effective_Charging_Limit', 'EVCC_Loadpoint_Title', 'EVCC_Vehicle_Charging_Limit_SoC', 'EVCC_Vehicle_Connected_Duration', 'EVCC_Vehicle_Data_Access', 'EVCC_Vehicle_Min_SoC', 'EVCC_Vehicle_Name', 'EVCC_Vehicle_Odometer', 'EVCC_Vehicle_Plan_Enabled', 'EVCC_Vehicle_Plan_SoC', 'EVCC_Vehicle_Plan_Time', 'EVCC_Vehicle_Range', 'EVCC_Vehicle_SoC', 'EVCC_Vehicle_Title', 'EVCC_Version', 'GoeCharger_Access_Configuration', 'GoeCharger_Allow_Charging', 'GoeCharger_Awatttar_Max_Price', 'GoeCharger_Cable_Encoding', 'GoeCharger_Error_Code', 'GoeCharger_Firmware', 'GoeCharger_Force_state', 'GoeCharger_Phases', 'GoeCharger_PWM_signal_status', 'GoeCharger_Transaction', 'iPad_Air_2024_Ylvie_AccessPoint', 'iPad_Air_2024_Ylvie_Drahtloses_Netzwerk', 'iPad_Air_2024_Ylvie_Experience', 'iPad_Air_2024_Ylvie_Hostname', 'iPad_Air_2024_Ylvie_IP_Addresse', 'iPad_Air_2024_Ylvie_MAC_Adresse', 'iPad_Air_2024_Ylvie_Name', 'iPad_Air_2024_Ylvie_Online', 'iPad_Air_2024_Ylvie_Online_seit', 'iPad_Air_2024_Ylvie_Zuletzt_gesehen', 'iPhone_12_Ylvie_AccessPoint', 'iPhone_12_Ylvie_Drahtloses_Netzwerk', 'iPhone_12_Ylvie_Experience', 'iPhone_12_Ylvie_Hostname', 'iPhone_12_Ylvie_IP_Addresse', 'iPhone_12_Ylvie_MAC_Adresse', 'iPhone_12_Ylvie_Online', 'iPhone_12_Ylvie_Online_seit', 'iPhone_12_Ylvie_Zuletzt_gesehen', 'iPhone_13_Nevia_AccessPoint', 'iPhone_13_Nevia_Drahtloses_Netzwerk', 'iPhone_13_Nevia_Experience', 'iPhone_13_Nevia_Hostname', 'iPhone_13_Nevia_IP_Addresse', 'iPhone_13_Nevia_MAC_Adresse', 'iPhone_13_Nevia_Name', 'iPhone_13_Nevia_Online', 'iPhone_13_Nevia_Online_seit', 'iPhone_13_Nevia_Zuletzt_gesehen', 'iPhone_16_Pro_Michi_AccessPoint', 'iPhone_16_Pro_Michi_Drahtloses_Netzwerk', 'iPhone_16_Pro_Michi_Experience', 'iPhone_16_Pro_Michi_Hostname', 'iPhone_16_Pro_Michi_IP_Addresse', 'iPhone_16_Pro_Michi_MAC_Adresse', 'iPhone_16_Pro_Michi_Name', 'iPhone_16_Pro_Michi_Online', 'iPhone_16_Pro_Michi_Online_seit', 'iPhone_16_Pro_Michi_Zuletzt_gesehen', 'KNX_Helios_KWRL_Restlaufzeit_Filter', 'KNX_Hormann_Garagentor_Status_Tor_geschlossen', 'KNX_Hormann_Garagentor_Status_Tor_offen', 'KNX_SAH3_Licht_Waschraum', 'KNX_Wetterstation_Dammerschwelle_uberschritten', 'KNX_Wetterstation_Regen', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_AC_Frequency', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Day', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Month', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Total', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_CO2_Savings_Year', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Cos_Phi', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Feedin_Limit_Relative', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_MC_Errors', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Errors', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SCB_Warnings', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_SFH_Errors', 'KOSTAL_PLENTICORE_Plus_100_no_Battery_Uptime', 'Samsung_Galaxy_A55_Sabrina_AccessPoint', 'Samsung_Galaxy_A55_Sabrina_Drahtloses_Netzwerk', 'Samsung_Galaxy_A55_Sabrina_Experience', 'Samsung_Galaxy_A55_Sabrina_Hostname', 'Samsung_Galaxy_A55_Sabrina_IP_Addresse', 'Samsung_Galaxy_A55_Sabrina_MAC_Adresse', 'Samsung_Galaxy_A55_Sabrina_Name', 'Samsung_Galaxy_A55_Sabrina_Online', 'Samsung_Galaxy_A55_Sabrina_Online_seit', 'Samsung_Galaxy_A55_Sabrina_Zuletzt_gesehen', 'Samsung_TV_Keller_Art_Mode', 'Samsung_TV_Keller_Artwork_Orientation', 'Samsung_TV_Keller_Kanal', 'Samsung_TV_Keller_Kanalnummer', 'Samsung_TV_Keller_Lautstarke', 'Samsung_TV_Keller_Power', 'Samsung_TV_Keller_Source', 'Samsung_TV_Keller_Stumm_schalten', 'Samsung_TV_Keller_Tastendruck', 'Samsung_TV_Keller_Titel', 'Samsung_TV_Wohnzimmer_Art_Mode', 'Samsung_TV_Wohnzimmer_Artwork_Orientation', 'Samsung_TV_Wohnzimmer_Kanal', 'Samsung_TV_Wohnzimmer_Kanalnummer', 'Samsung_TV_Wohnzimmer_Lautstarke', 'Samsung_TV_Wohnzimmer_Power', 'Samsung_TV_Wohnzimmer_Source', 'Samsung_TV_Wohnzimmer_Stumm_schalten', 'Samsung_TV_Wohnzimmer_Tastendruck', 'Samsung_TV_Wohnzimmer_Titel', 'Shelly_HT_Bad_Letzter_Fehler', 'Shelly_Plug_Buro_Keller_BetriebsLED_aus', 'Shelly_Plug_Buro_Keller_StatusLED_aus', 'Shelly_Plug_Speis_BetriebsLED_aus', 'Shelly_Plug_Speis_StatusLED_aus', 'Shelly_Plug_Wohnzimmer_StatusLED_aus', 'Shelly_RGBW_PM_Buro_Keller_AutoANTimer', 'Shelly_RGBW_PM_Buro_Keller_AutoAUS_Timer', 'Shelly_RGBW_PM_Buro_Keller_Blau', 'Shelly_RGBW_PM_Buro_Keller_Firmwareaktualisierung_verfugbar', 'Shelly_RGBW_PM_Buro_Keller_Grun', 'Shelly_RGBW_PM_Buro_Keller_Helligkeit', 'Shelly_RGBW_PM_Buro_Keller_Laufzeit', 'Shelly_RGBW_PM_Buro_Keller_Letzte_Aktivitat', 'Shelly_RGBW_PM_Buro_Keller_Rot', 'Shelly_RGBW_PM_Buro_Keller_Volltonfarbe', 'Shelly_RGBW_PM_Buro_Keller_Weiss', 'ShellyHT_Wohnzimmer_Letzter_Fehler', 'Spotify_Album_Name', 'Spotify_Playlist_Name', 'TXNR636_Zone1_Input', 'TXNR636_Zone1_Mute', 'TXNR636_Zone1_Power', 'TXNR636_Zone1_Volume'],
      'Control': ['EVCC_Charging_max_Current', 'EVCC_Charging_min_Current', 'GoeCharger_Current_Session_Charge_Energy_Limit', 'GoeCharger_Maximum_Current', 'GoeCharger_Maximum_Current_Temporary', 'KNX_2fach_Taster_Buro_Keller_Stiege_Multimedia', 'KNX_Hormann_Garagentor_Garagentor', 'KNX_JA1_Raffstore_Esstisch', 'KNX_JA1_Raffstore_Wohnzimmer', 'KNX_JA1_Raffstore_Wohnzimmer_Strasse', 'KNX_JA2_Rollladen_Michi__Sabrina', 'KNX_JA2_Rollladen_Nevia', 'KNX_JA2_Rollladen_Schrankraum', 'KNX_JA2_Rollladen_Ylvie', 'KNX_RA1_CH01', 'KNX_RA1_CH04', 'KNX_RA1_Markise_Terrasse', 'KNX_RA1_Rollladen_Buro', 'KNX_SAH1_Stromerkennung_Licht_Buro', 'KNX_SAH1_Stromerkennung_Licht_Nevia', 'KNX_SAH1_Stromerkennung_Licht_Schlafzimmer', 'KNX_SAH1_Stromerkennung_Licht_Schrankraum', 'KNX_SAH1_Stromerkennung_Licht_Ylvie', 'KNX_SAH2_Licht_Einfahrt', 'KNX_SAH2_Licht_Eingang', 'KNX_SAH2_Licht_Garage', 'KNX_SAH2_Licht_Keller_Anschlussraum', 'KNX_SAH2_Licht_Keller_Gang', 'KNX_SAH2_Licht_Terrasse_Saulen', 'KNX_SAH2_Licht_Terrasse_Wand', 'KNX_SAH2_Licht_WC_Keller', 'KNX_SAH3_Licht_Bad_Dusche', 'KNX_SAH3_Licht_Bad_Spiegel', 'KNX_SAH3_Licht_Fitness', 'KNX_SAH3_Licht_Schleuse', 'KNX_SAH3_Licht_Serverraum', 'KNX_SAH3_Licht_Technikraum', 'KNX_State_Flag_Item_Late', 'KNX_Status_Flags_KNX_Status_Nacht', 'SAH1_Stromerkennung_Licht_Esstisch', 'SAH1_Stromerkennung_Licht_Speis', 'SAH2_Licht_Keller_Buro', 'SAH3_Licht_Couch', 'SAH3_Licht_TV', 'SHA1_Stromerkennung_Licht_Kuche', 'Shelly_Plug_Buro_Keller_Betrieb', 'Shelly_Plug_Speis_Betrieb', 'Shelly_Plug_Wohnzimmer_Betrieb', 'Shelly_RGBW_PM_Buro_Keller_Farbe', 'Spotify_Active_Device_Name', 'Spotify_Active_Device_Shuffle', 'Spotify_Active_Devices', 'Spotify_Fernbedienung', 'Spotify_Lautstarke', 'Spotify_Playlists', 'Spotify_Repeat_Mode'],
    },
  }
}

// Get items by property across all types
export function getItemsByProperty(propertyName: string): string[] {
  const result: string[] = []
  const semanticData = getItemsBySemanticType()

  Object.values(semanticData).forEach(typeData => {
    if (typeData[propertyName]) {
      result.push(...typeData[propertyName])
    }
  })

  return result
}
// =============================================================================
// STATISTICS AND METADATA
// =============================================================================

export const SEMANTIC_TYPES = {
  'Equipment': 21,
  'Group': 1,
  'Location': 30,
  'Point': 309,
} as const

// Overall statistics
export const TOTAL_ITEMS = 361
export const TOTAL_SEMANTIC_TYPES = 4

// Semantic structure overview
export const SEMANTIC_STRUCTURE = {
  'Equipment': {
    properties: ['AudioVisual', 'Computer', 'Door', 'General', 'HVAC', 'PowerOutlet', 'Sensor', 'Smartphone'],
    totalItems: 21
  },
  'Group': {
    properties: ['General'],
    totalItems: 1
  },
  'Location': {
    properties: ['General', 'Indoor'],
    totalItems: 30
  },
  'Point': {
    properties: ['Control', 'General', 'Measurement', 'Setpoint', 'Status'],
    totalItems: 309
  },
} as const

// =============================================================================
// USAGE EXAMPLES
// =============================================================================
//
// import { Point, Equipment, Location, ITEMS } from './generated-items'
//
// // Semantic access:
// const tempSensor = Point.Measurement.Living_Room_Temperature
// const lightSwitch = Point.Control.Kitchen_Light_Switch
// const hvacSystem = Equipment.HVAC.Main_HVAC_Unit
//
// // Flat access (backward compatibility):
// const anyItem = ITEMS.Some_Item_Name
//
// // Type-safe usage with OpenHAB:
// import { items } from 'openhab'
// const item = items.getItem(Point.Measurement.Living_Room_Temperature)
//
// // Helper functions:
// const allPointItems = getAllItemsFromDomain(Point)
// const allTempItems = getItemsByProperty('Temperature')
//
