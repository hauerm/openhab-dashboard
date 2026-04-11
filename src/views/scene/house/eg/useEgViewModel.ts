import { useMemo } from "react";
import type {
  LocationPropertyHistoryControlDefinition,
  VentilationControlDefinition,
} from "../../controls/controlDefinitions";
import {
  useLocationPropertyHistoryLayoutMetadataItemNames,
} from "../../controls/location-property-history/model";
import { useVentilationLayoutMetadataItemNames } from "../../controls/ventilation/model";
import { EG_VIEW_CONTROL_DEFINITIONS } from "./egView.descriptor";

const [
  temperatureDefinition,
  humidityDefinition,
  co2Definition,
  airQualityDefinition,
  ventilationDefinition,
] = EG_VIEW_CONTROL_DEFINITIONS as readonly [
  LocationPropertyHistoryControlDefinition,
  LocationPropertyHistoryControlDefinition,
  LocationPropertyHistoryControlDefinition,
  LocationPropertyHistoryControlDefinition,
  VentilationControlDefinition,
];

export const useEgViewModel = (): readonly (
  | LocationPropertyHistoryControlDefinition
  | VentilationControlDefinition
)[] => {
  const temperatureMetadataItemNames =
    useLocationPropertyHistoryLayoutMetadataItemNames(temperatureDefinition);
  const humidityMetadataItemNames =
    useLocationPropertyHistoryLayoutMetadataItemNames(humidityDefinition);
  const co2MetadataItemNames =
    useLocationPropertyHistoryLayoutMetadataItemNames(co2Definition);
  const airQualityMetadataItemNames =
    useLocationPropertyHistoryLayoutMetadataItemNames(airQualityDefinition);
  const ventilationMetadataItemNames = useVentilationLayoutMetadataItemNames();

  return useMemo(
    () => [
      {
        ...temperatureDefinition,
        layoutMetadataItemNames: temperatureMetadataItemNames,
      },
      {
        ...humidityDefinition,
        layoutMetadataItemNames: humidityMetadataItemNames,
      },
      {
        ...co2Definition,
        layoutMetadataItemNames: co2MetadataItemNames,
      },
      {
        ...airQualityDefinition,
        layoutMetadataItemNames: airQualityMetadataItemNames,
      },
      {
        ...ventilationDefinition,
        layoutMetadataItemNames: ventilationMetadataItemNames,
      },
    ],
    [
      airQualityMetadataItemNames,
      co2MetadataItemNames,
      humidityMetadataItemNames,
      temperatureMetadataItemNames,
      ventilationMetadataItemNames,
    ]
  );
};
