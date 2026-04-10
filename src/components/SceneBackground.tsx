import { SCENE_VIEWS } from "../config/sceneViews";
import { useSceneStoreCore } from "../stores/sceneStoreCore";
import { resolveSceneImagePath } from "../stores/sceneStore.utils";

const SceneBackground = () => {
  const currentView = useSceneStoreCore((state) => state.currentView);
  const missingAsset = useSceneStoreCore(
    (state) => state.missingAssetByView[currentView]
  );
  const setMissingAsset = useSceneStoreCore((state) => state.setMissingAsset);

  const currentViewConfig = SCENE_VIEWS[currentView];
  const resolvedSceneImage = resolveSceneImagePath(currentViewConfig, missingAsset);

  return (
    <div className="absolute inset-0">
      <img
        data-testid="scene-background-image"
        src={resolvedSceneImage.resolvedImage}
        alt={`${currentViewConfig.label} Kontextfoto`}
        className="h-full w-full object-cover object-center"
        onError={() => {
          setMissingAsset(currentView, true);
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />

      {resolvedSceneImage.usedFallback && (
        <div
          data-testid="scene-missing-asset-badge"
          className="absolute right-4 top-4 rounded-lg border border-amber-300/70 bg-amber-500/85 px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg"
        >
          Missing scene asset
        </div>
      )}
    </div>
  );
};

export default SceneBackground;
