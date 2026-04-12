import type { VentilationControlDefinition } from "../../controls/controlDefinitions";
import { useVentilationLayoutMetadataItemNames } from "../../controls/ventilation/model";
import { EG_VIEW_CONTROL_DEFINITIONS } from "./egView.descriptor";

const [ventilationDefinition] = EG_VIEW_CONTROL_DEFINITIONS as readonly [
  VentilationControlDefinition,
];

export const useEgViewModel = (): readonly VentilationControlDefinition[] => {
  const ventilationMetadataItemNames = useVentilationLayoutMetadataItemNames();

  return [
    {
      ...ventilationDefinition,
      layoutMetadataItemNames: ventilationMetadataItemNames,
    },
  ];
};
