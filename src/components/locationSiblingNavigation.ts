import type { OpenHABSemanticModel } from "../domain/openhab-model";
import type { ViewId } from "../types/view";

export const getSiblingViewId = (
  model: OpenHABSemanticModel | null,
  currentView: ViewId,
  direction: "previous" | "next"
): ViewId | null => {
  if (!model) {
    return null;
  }

  const currentLocation = model.locationsByName.get(currentView);
  if (!currentLocation?.parentName) {
    return null;
  }

  const siblingLocationNames =
    model.childLocationNamesByParentName[currentLocation.parentName] ?? [];
  const currentIndex = siblingLocationNames.indexOf(currentView);
  if (currentIndex === -1) {
    return null;
  }

  const targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
  return siblingLocationNames[targetIndex] ?? null;
};
