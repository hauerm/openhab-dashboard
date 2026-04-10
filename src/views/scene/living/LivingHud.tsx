import type { SceneViewHudProps } from "../types";
import LightControl from "../controls/LightControl";
import RaffstoreControl from "../controls/RaffstoreControl";
import { useLivingViewStore } from "./useLivingViewStore";

const LivingHud = ({ onOpenOverlay }: SceneViewHudProps) => {
  void onOpenOverlay;
  const { raffstores, lights } = useLivingViewStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-4 md:p-6">
      <div className="mx-auto flex h-full max-w-6xl flex-col justify-between gap-4">
        <section
          data-testid="living-raffstore-controls"
          className="grid grid-cols-2 gap-3 self-start md:max-w-md"
        >
          {raffstores.map((raffstore) => (
            <RaffstoreControl
              key={raffstore.id}
              controlId={raffstore.id}
              label={raffstore.label}
              itemName={raffstore.itemName}
              openingRawState={raffstore.openingRawState}
            />
          ))}
        </section>

        <section
          data-testid="living-light-controls"
          className="grid grid-cols-2 gap-3 self-end"
        >
          {lights.map((light) => (
            <LightControl
              key={light.id}
              controlId={light.id}
              label={light.label}
              itemName={light.itemName}
              rawState={light.rawState}
            />
          ))}
        </section>
      </div>
    </div>
  );
};

export default LivingHud;
