import { useMemo } from "react";
import { useViewStore } from "../stores/viewStore";
import type { ViewConfig, ViewId } from "../types/view";

export interface LocationDockItem {
  viewId: ViewId;
  viewConfig: ViewConfig;
  viewLabel: string;
  isParent: boolean;
  isActive: boolean;
}

interface DockLocationCandidate {
  viewId: ViewId;
  isParent: boolean;
}

export const useLocationDockItems = (): readonly LocationDockItem[] => {
  const currentView = useViewStore((state) => state.currentView);
  const viewConfigs = useViewStore((state) => state.viewConfigs);
  const viewLabels = useViewStore((state) => state.viewLabels);
  const model = useViewStore((state) => state.model);

  return useMemo(() => {
    if (!model) {
      return [];
    }

    const currentLocation = model.locationsByName.get(currentView);
    if (!currentLocation) {
      return [];
    }

    const childLocationNames =
      model.childLocationNamesByParentName[currentView] ?? [];
    let candidates: DockLocationCandidate[];

    if (currentLocation.parentName === null) {
      candidates = childLocationNames.map((viewId) => ({
        viewId,
        isParent: false,
      }));
    } else if (childLocationNames.length > 0) {
      candidates = [
        { viewId: currentLocation.parentName, isParent: true },
        ...childLocationNames.map((viewId) => ({
          viewId,
          isParent: false,
        })),
      ];
    } else {
      const parentName = currentLocation.parentName;
      const siblingLocationNames =
        model.childLocationNamesByParentName[parentName] ?? [];
      const parentLocation = model.locationsByName.get(parentName);

      candidates =
        !parentLocation || parentLocation.parentName === null
          ? siblingLocationNames.map((viewId) => ({
              viewId,
              isParent: false,
            }))
          : [
              { viewId: parentLocation.parentName, isParent: true },
              ...siblingLocationNames.map((viewId) => ({
                viewId,
                isParent: false,
              })),
            ];
    }

    return candidates.flatMap(({ viewId, isParent }) => {
      const viewConfig = viewConfigs[viewId];
      if (!viewConfig) {
        return [];
      }

      return [
        {
          viewId,
          viewConfig,
          viewLabel: viewLabels[viewId] ?? viewConfig.label,
          isParent,
          isActive: currentView === viewId,
        },
      ];
    });
  }, [currentView, model, viewConfigs, viewLabels]);
};
