import { useViewStore } from "../stores/viewStore";
import { resolveViewImagePath } from "../stores/viewStore.utils";

const ViewBackground = () => {
  const currentView = useViewStore((state) => state.currentView);
  const currentViewConfig = useViewStore(
    (state) => state.viewConfigs[currentView]
  );
  const missingAsset = useViewStore(
    (state) => state.missingAssetByView[currentView]
  );
  const setMissingAsset = useViewStore((state) => state.setMissingAsset);
  const currentViewLabel = useViewStore(
    (state) => state.viewLabels[currentView] ?? currentViewConfig?.label ?? currentView
  );

  if (!currentViewConfig) {
    return null;
  }

  const resolvedViewImage = resolveViewImagePath(
    currentViewConfig,
    missingAsset ?? false
  );

  return (
    <div className="absolute inset-0">
      <img
        data-testid="view-background-image"
        src={resolvedViewImage.resolvedImage}
        alt={`${currentViewLabel} Kontextfoto`}
        className="h-full w-full object-cover object-center"
        onError={() => {
          setMissingAsset(currentView, true);
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />

      {resolvedViewImage.usedFallback && (
        <div
          data-testid="view-missing-asset-badge"
          className="absolute right-4 top-4 rounded-lg border border-ui-warning-border bg-ui-warning-solid px-3 py-1 text-xs font-semibold text-ui-warning-foreground shadow-lg"
        >
          Missing view asset
        </div>
      )}
    </div>
  );
};

export default ViewBackground;
