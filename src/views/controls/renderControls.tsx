import {
  DimmerHudControl,
  DimmerOverlayControl,
  LightHudControl,
  LightOverlayControl,
} from "./light";
import { EvccHudControl, EvccOverlayControl } from "./evcc";
import {
  LocationPropertyHistoryHudControl,
  LocationPropertyHistoryOverlayControl,
} from "./location-property-history";
import { PowerHudControl, PowerOverlayControl } from "./power";
import {
  RaffstoreHudControl,
  RaffstoreOverlayControl,
} from "./raffstore";
import {
  RgbwLightHudControl,
  RgbwLightOverlayControl,
} from "./rgbw-light";
import { TvHudControl, TvOverlayControl } from "./tv";
import {
  VentilationHudControl,
  VentilationOverlayControl,
} from "./ventilation";
import type { ViewControlDefinition } from "./controlDefinitions";

export interface RenderHudControlOptions {
  variant?: "default" | "compact";
}

export const renderHudControl = (
  definition: ViewControlDefinition,
  layoutEditMode: boolean,
  onOpenControl: (controlId: string) => void,
  options: RenderHudControlOptions = {}
) => {
  const variant = options.variant ?? "default";

  if (definition.controlType === "opening") {
    return (
      <RaffstoreHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "light") {
    return (
      <LightHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "dimmer") {
    return (
      <DimmerHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "rgbw-light") {
    return (
      <RgbwLightHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "tv") {
    return (
      <TvHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "evcc") {
    return (
      <EvccHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "power") {
    return (
      <PowerHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "ventilation") {
    return (
      <VentilationHudControl
        definition={definition}
        interactive={!layoutEditMode}
        variant={variant}
        onOpenControl={onOpenControl}
      />
    );
  }
  if (definition.controlType === "location-property-history") {
    return (
      <LocationPropertyHistoryHudControl
        definition={definition}
        interactive={!layoutEditMode}
        onOpenControl={onOpenControl}
      />
    );
  }
  return null;
};

export const renderOverlayControl = (
  definition: ViewControlDefinition | null,
  onCloseControl: () => void
) => {
  if (!definition) {
    return null;
  }
  if (definition.controlType === "opening") {
    return <RaffstoreOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "light") {
    return <LightOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "dimmer") {
    return <DimmerOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "rgbw-light") {
    return <RgbwLightOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "tv") {
    return <TvOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "evcc") {
    return <EvccOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "power") {
    return <PowerOverlayControl definition={definition} onClose={onCloseControl} />;
  }
  if (definition.controlType === "ventilation") {
    return (
      <VentilationOverlayControl
        definition={definition}
        onClose={onCloseControl}
      />
    );
  }
  if (definition.controlType === "location-property-history") {
    return (
      <LocationPropertyHistoryOverlayControl
        definition={definition}
        onClose={onCloseControl}
      />
    );
  }
  return null;
};
