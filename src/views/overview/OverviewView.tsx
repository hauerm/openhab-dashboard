import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  MdExpandLess,
  MdExpandMore,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdPowerSettingsNew,
  MdSpaceDashboard,
  MdStop,
} from "react-icons/md";
import { toast } from "react-toastify";
import LocationDockButton from "../../components/LocationDockButton";
import { useLocationDockItems } from "../../components/locationDockModel";
import { getSiblingViewId } from "../../components/locationSiblingNavigation";
import { useViewStore } from "../../stores/viewStore";
import type { OpenHABSemanticModel } from "../../domain/openhab-model";
import type { ViewId, ViewTrackedItemState } from "../../types/view";
import type { ViewControlDefinition } from "../controls/controlDefinitions";
import { renderHudControl, renderOverlayControl } from "../controls/renderControls";
import { parseHsbState } from "../controls/rgbw-light/model";
import {
  LocationPropertyStateBlock,
  LocationPropertyStateOverlay,
} from "../LocationPropertyStateBlocks";
import { useLocationPropertyStateBlocks } from "../locationPropertyStateBlocksModel";
import {
  POINTER_HORIZONTAL_SWIPE_FACTOR,
  POINTER_SWIPE_MIN_DISTANCE_PX,
  getPointerTargetElement,
  isPrimaryPointer,
} from "../pointerGestures";
import type { ViewProps } from "../types";
import {
  getOverviewControlMetadata,
  getOverviewGroupDefinition,
  type AggregateCapability,
  type OverviewExpandedLayout,
  type OverviewGroupKey,
} from "./overviewRegistry";
import {
  sendLightsAggregateCommand,
  sendPowerAggregateCommand,
  sendShadingAggregateCommand,
} from "./aggregateCommands";

interface OverviewViewProps extends ViewProps {
  viewId: ViewId;
  onSwitchToLocationView: () => void;
  allowLocationViewSwitch?: boolean;
}

interface ScopedControl {
  definition: ViewControlDefinition;
}

interface ControlGroup {
  groupKey: OverviewGroupKey;
  label: string;
  sortOrder: number;
  expandedLayout: OverviewExpandedLayout;
  controls: ScopedControl[];
  aggregateCapability: AggregateCapability | null;
}

interface ExpandedGroupState {
  viewId: ViewId;
  groupKeys: Set<OverviewGroupKey>;
}

interface OverviewSwipeGestureState {
  pointerId: number;
  startX: number;
  startY: number;
  handledSwipe: boolean;
}

const EMPTY_EXPANDED_GROUP_KEYS = new Set<OverviewGroupKey>();
const OVERVIEW_SWIPE_BLOCKED_TARGET_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[role='link']",
  "[role='slider']",
  "[data-pointer-interactive='true']",
].join(",");

const isOverviewSwipeBlockedTarget = (target: EventTarget | null): boolean => {
  const targetElement = getPointerTargetElement(target);
  return Boolean(targetElement?.closest(OVERVIEW_SWIPE_BLOCKED_TARGET_SELECTOR));
};

const collectLocationScope = (
  viewId: ViewId,
  model: OpenHABSemanticModel
): readonly string[] => {
  const locationNames: string[] = [];
  const visit = (locationName: string) => {
    if (!model.locationsByName.has(locationName)) {
      return;
    }
    locationNames.push(locationName);
    for (const childName of model.childLocationNamesByParentName[locationName] ?? []) {
      visit(childName);
    }
  };

  visit(viewId);
  return locationNames;
};

const buildScopedControls = (
  viewId: ViewId,
  model: OpenHABSemanticModel
): ScopedControl[] =>
  collectLocationScope(viewId, model).flatMap((locationName) =>
    (model.controlsByLocation[locationName] ?? []).map((definition) => ({
      definition,
    }))
  );

const buildControlGroups = (
  controls: readonly ScopedControl[]
): ControlGroup[] => {
  const byGroup = new Map<OverviewGroupKey, ControlGroup>();

  for (const control of controls) {
    const metadata = getOverviewControlMetadata(control.definition);
    const groupDefinition = getOverviewGroupDefinition(metadata.overviewGroup);
    const group = byGroup.get(metadata.overviewGroup) ?? {
      groupKey: metadata.overviewGroup,
      label: groupDefinition.label,
      sortOrder: groupDefinition.sortOrder,
      expandedLayout: groupDefinition.expandedLayout,
      controls: [],
      aggregateCapability: null,
    };

    group.controls.push(control);
    if (metadata.aggregateEnabled && metadata.aggregateCapability) {
      group.aggregateCapability = metadata.aggregateCapability;
    }
    byGroup.set(metadata.overviewGroup, group);
  }

  return Array.from(byGroup.values()).sort(
    (left, right) => left.sortOrder - right.sortOrder
  );
};

const COUNT_LABEL_BY_GROUP_KEY: Record<
  OverviewGroupKey,
  { singular: string; plural: string }
> = {
  lights: { singular: "Licht", plural: "Lichter" },
  shading: { singular: "Beschattung", plural: "Beschattungen" },
  awning: { singular: "Markise", plural: "Markisen" },
  power: { singular: "Steckdose", plural: "Steckdosen" },
  tv: { singular: "TV", plural: "TVs" },
  ventilation: { singular: "Lüftung", plural: "Lüftungen" },
  evcc: { singular: "Ladepunkt", plural: "Ladepunkte" },
  doors: { singular: "Tor", plural: "Tore" },
  other: { singular: "Control", plural: "Controls" },
};

const formatGroupTitle = (group: ControlGroup): string => {
  return formatGroupCountLabel(group.groupKey, group.controls.length);
};

const formatGroupCountLabel = (
  groupKey: OverviewGroupKey,
  count: number
): string => {
  const labels = COUNT_LABEL_BY_GROUP_KEY[groupKey];
  return `${count} ${count === 1 ? labels.singular : labels.plural}`;
};

const parseSwitchLikeIsOn = (rawState: string | undefined): boolean => {
  if (!rawState) {
    return false;
  }

  const normalized = rawState.trim().toUpperCase();
  if (normalized === "ON") {
    return true;
  }
  if (
    normalized === "OFF" ||
    normalized === "UNDEF" ||
    normalized === "NULL" ||
    normalized === "-"
  ) {
    return false;
  }

  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) {
    return false;
  }

  const parsed = Number.parseFloat(match[0].replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0;
};

const isAggregateLightOn = (
  definition: ViewControlDefinition,
  itemStates: Record<string, ViewTrackedItemState>
): boolean => {
  if (definition.controlType === "light" || definition.controlType === "dimmer") {
    return parseSwitchLikeIsOn(itemStates[definition.itemRefs.itemName]?.rawState);
  }

  if (definition.controlType === "rgbw-light") {
    return (
      parseHsbState(itemStates[definition.itemRefs.colorItemName]?.rawState)
        .brightness > 0
    );
  }

  return false;
};

const isAggregatePowerOn = (
  definition: ViewControlDefinition,
  itemStates: Record<string, ViewTrackedItemState>
): boolean => {
  if (definition.controlType !== "power") {
    return false;
  }

  return parseSwitchLikeIsOn(
    itemStates[definition.itemRefs.powerItemName]?.rawState
  );
};

const activateNestedHudButton = (event: MouseEvent<HTMLDivElement>): void => {
  const target = event.target;
  if (target instanceof Element && target.closest("button")) {
    return;
  }

  event.currentTarget.querySelector("button")?.click();
};

const CONTROL_LABEL_MAX_LENGTH = 17;

const formatControlLabel = (label: string): string =>
  label.length > CONTROL_LABEL_MAX_LENGTH
    ? `${label.slice(0, CONTROL_LABEL_MAX_LENGTH).trimEnd()}...`
    : label;

const OverviewControlItem = ({
  control,
  layout,
  onOpenControl,
}: {
  control: ScopedControl;
  layout: OverviewExpandedLayout;
  onOpenControl: (controlId: string) => void;
}) => {
  const displayLabel = formatControlLabel(control.definition.label);
  const detailList = layout === "detail-list";

  return (
    <div
      data-testid={`overview-control-${control.definition.controlId}`}
      onClick={activateNestedHudButton}
      className={`group flex min-w-0 cursor-pointer flex-col items-center justify-start gap-0.5 ${
        detailList ? "w-full items-start" : ""
      }`}
    >
      <div
        className={
          detailList
            ? "relative flex w-full max-w-[24rem] justify-start md:max-w-[32rem]"
            : "relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28"
        }
      >
        {renderHudControl(control.definition, false, onOpenControl)}
      </div>
      <p
        className={`truncate text-center font-black leading-tight text-ui-foreground [text-shadow:0_2px_10px_var(--color-ui-shadow-text)] ${
          detailList
            ? "w-20 max-w-20 text-sm md:w-24 md:max-w-24 md:text-base"
            : "max-w-[6.25rem] text-xs md:max-w-[7rem] md:text-sm"
        }`}
        title={control.definition.label}
      >
        {displayLabel}
      </p>
    </div>
  );
};

const getExpandedControlsClassName = (
  layout: OverviewExpandedLayout
): string =>
  layout === "detail-list"
    ? "mt-4 flex w-full flex-col items-start gap-5 md:mt-5 md:gap-7"
    : "mt-4 grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 md:mt-5 md:gap-x-4 md:gap-y-7";

const MobileTopDock = ({
  open,
  viewLabel,
  onClose,
  onViewChange,
}: {
  open: boolean;
  viewLabel: string;
  onClose: () => void;
  onViewChange: (viewId: ViewId) => void;
}) => {
  const dockItems = useLocationDockItems();

  if (!open) {
    return null;
  }

  return (
    <div
      data-testid="mobile-top-dock"
      data-visible="true"
      className="fixed inset-0 z-40 overflow-y-auto bg-ui-surface-shell/90 px-3 pb-6 pt-0 text-ui-foreground shadow-2xl backdrop-blur-xl md:hidden"
    >
      <div className="sticky top-0 z-10 -mx-3 bg-ui-surface-shell/72 px-3 py-3 backdrop-blur-xl">
        <button
          type="button"
          data-testid="mobile-top-dock-collapse"
          aria-expanded="true"
          onClick={onClose}
          className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 text-left text-ui-foreground"
          aria-label="Raumnavigation schließen"
        >
          <span className="min-w-0 break-words text-2xl font-bold leading-tight [overflow-wrap:anywhere] [text-shadow:0_2px_10px_var(--color-ui-shadow-text)]">
            {viewLabel}
          </span>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ui-border-subtle bg-ui-surface-overlay/80 shadow-[0_8px_28px_var(--color-ui-shadow-panel)] backdrop-blur-md">
            <MdKeyboardArrowUp className="h-7 w-7" />
          </span>
        </button>
      </div>

      <div data-testid="mobile-top-dock-panel" className="grid gap-2 pt-3">
        {dockItems.map((item) => (
          <LocationDockButton
            key={item.viewId}
            item={item}
            className="h-32 w-full"
            onClick={({ viewId }) => {
              onViewChange(viewId);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const MobileOverviewStateGrid = ({
  viewId,
  activeControlId,
  onOpenControl,
  onCloseControl,
}: {
  viewId: ViewId;
  activeControlId: string | null;
  onOpenControl: (controlId: string) => void;
  onCloseControl: () => void;
}) => {
  const { entries, activeDefinition } = useLocationPropertyStateBlocks(
    viewId,
    activeControlId
  );

  if (entries.length === 0) {
    return (
      <LocationPropertyStateOverlay
        activeDefinition={activeDefinition}
        onClose={onCloseControl}
      />
    );
  }

  return (
    <>
      <div
        data-testid="mobile-overview-state-grid"
        className="grid grid-cols-2 gap-2 md:hidden"
      >
        {entries.map((entry) => (
          <LocationPropertyStateBlock
            key={entry.definition.controlId}
            entry={entry}
            onOpenControl={onOpenControl}
            variant="mobile-grid"
          />
        ))}
      </div>
      <LocationPropertyStateOverlay
        activeDefinition={activeDefinition}
        onClose={onCloseControl}
      />
    </>
  );
};

const AGGREGATE_BUTTON_BASE_CLASS =
  "pointer-events-auto flex min-h-16 w-full items-center justify-center rounded-2xl border border-ui-border-subtle px-3 text-ui-foreground shadow-[0_10px_34px_var(--color-ui-shadow-panel)] backdrop-blur-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 md:min-h-20";
const AGGREGATE_BUTTON_DEFAULT_CLASS = "bg-ui-surface-panel/80";
const AGGREGATE_BUTTON_LIGHT_ON_CLASS =
  "bg-semantic-light-solid text-ui-surface-shell shadow-[0_0_52px_8px_var(--color-semantic-light-glow)]";
const AGGREGATE_ICON_CLASS = "h-7 w-7 md:h-8 md:w-8";

interface AggregateAction {
  actionKey: string;
  ariaLabel: string;
  confirmVerb: string;
  testId: string;
  icon: ReactNode;
  className?: string;
  execute: () => Promise<{ attempted: number; failed: number }>;
}

const AggregateActions = ({ group }: { group: ControlGroup }) => {
  const [sendingAction, setSendingAction] = useState<string | null>(null);
  const itemStates = useViewStore((state) => state.itemStates);
  const aggregateControls = group.controls
    .filter((control) => {
      const metadata = getOverviewControlMetadata(control.definition);
      return (
        metadata.aggregateEnabled &&
        metadata.aggregateCapability === group.aggregateCapability
      );
    })
    .map((control) => control.definition);

  if (!group.aggregateCapability || aggregateControls.length < 2) {
    return null;
  }

  const run = async (action: AggregateAction) => {
    if (sendingAction) {
      return;
    }

    const confirmed = window.confirm(
      `Wirklich ${formatGroupCountLabel(
        group.groupKey,
        aggregateControls.length
      )} ${action.confirmVerb}?`
    );
    if (!confirmed) {
      return;
    }

    setSendingAction(action.actionKey);
    try {
      const result = await action.execute();
      if (result.failed > 0) {
        toast.error(
          `${result.failed} von ${result.attempted} Befehlen konnten nicht gesendet werden.`
        );
      }
    } finally {
      setSendingAction(null);
    }
  };

  const actions: AggregateAction[] =
    group.aggregateCapability === "lights"
      ? (() => {
          const anyLightOn = aggregateControls.some((definition) =>
            isAggregateLightOn(definition, itemStates)
          );
          return [
            {
              actionKey: "lights-toggle",
              ariaLabel: `${formatGroupTitle(group)} ${
                anyLightOn ? "ausschalten" : "einschalten"
              }`,
              confirmVerb: anyLightOn ? "ausschalten" : "einschalten",
              testId: "overview-aggregate-lights-toggle",
              icon: <MdPowerSettingsNew className={AGGREGATE_ICON_CLASS} />,
              className: anyLightOn
                ? AGGREGATE_BUTTON_LIGHT_ON_CLASS
                : AGGREGATE_BUTTON_DEFAULT_CLASS,
              execute: () =>
                sendLightsAggregateCommand(
                  aggregateControls,
                  anyLightOn ? "OFF" : "ON"
                ),
            },
          ];
        })()
      : group.aggregateCapability === "shading"
      ? [
          {
            actionKey: "shading-UP",
            ariaLabel: `${formatGroupTitle(group)} öffnen`,
            confirmVerb: "öffnen",
            testId: "overview-aggregate-shading-up",
            icon: <MdKeyboardArrowUp className={AGGREGATE_ICON_CLASS} />,
            className: AGGREGATE_BUTTON_DEFAULT_CLASS,
            execute: () => sendShadingAggregateCommand(aggregateControls, "UP"),
          },
          {
            actionKey: "shading-STOP",
            ariaLabel: `${formatGroupTitle(group)} stoppen`,
            confirmVerb: "stoppen",
            testId: "overview-aggregate-shading-stop",
            icon: <MdStop className={AGGREGATE_ICON_CLASS} />,
            className: AGGREGATE_BUTTON_DEFAULT_CLASS,
            execute: () => sendShadingAggregateCommand(aggregateControls, "STOP"),
          },
          {
            actionKey: "shading-DOWN",
            ariaLabel: `${formatGroupTitle(group)} schließen`,
            confirmVerb: "schließen",
            testId: "overview-aggregate-shading-down",
            icon: <MdKeyboardArrowDown className={AGGREGATE_ICON_CLASS} />,
            className: AGGREGATE_BUTTON_DEFAULT_CLASS,
            execute: () => sendShadingAggregateCommand(aggregateControls, "DOWN"),
          },
        ]
      : group.aggregateCapability === "power"
      ? (() => {
          const anyPowerOn = aggregateControls.some((definition) =>
            isAggregatePowerOn(definition, itemStates)
          );
          return [
            {
              actionKey: "power-toggle",
              ariaLabel: `${formatGroupTitle(group)} ${
                anyPowerOn ? "ausschalten" : "einschalten"
              }`,
              confirmVerb: anyPowerOn ? "ausschalten" : "einschalten",
              testId: "overview-aggregate-power-toggle",
              icon: <MdPowerSettingsNew className={AGGREGATE_ICON_CLASS} />,
              className: anyPowerOn
                ? AGGREGATE_BUTTON_LIGHT_ON_CLASS
                : AGGREGATE_BUTTON_DEFAULT_CLASS,
              execute: () =>
                sendPowerAggregateCommand(
                  aggregateControls,
                  anyPowerOn ? "OFF" : "ON"
                ),
            },
          ];
        })()
      : [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      className="grid w-full gap-2"
      style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}
    >
      {actions.map((action) => (
        <button
          key={action.actionKey}
          type="button"
          data-testid={action.testId}
          aria-label={action.ariaLabel}
          disabled={Boolean(sendingAction)}
          onClick={() => {
            void run(action);
          }}
          className={`${AGGREGATE_BUTTON_BASE_CLASS} ${
            action.className ?? AGGREGATE_BUTTON_DEFAULT_CLASS
          }`}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};

const OverviewView = ({
  viewId,
  activeControlId,
  onOpenControl,
  onCloseControl,
  onSwitchToLocationView,
  allowLocationViewSwitch = true,
}: OverviewViewProps) => {
  const model = useViewStore((state) => state.model);
  const setCurrentView = useViewStore((state) => state.setCurrentView);
  const viewLabel = useViewStore(
    (state) => state.viewLabels[viewId] ?? state.viewConfigs[viewId]?.label ?? viewId
  );
  const [mobileDockOpen, setMobileDockOpen] = useState(false);
  const overviewSwipeGestureRef = useRef<OverviewSwipeGestureState | null>(null);
  const scopedControls = useMemo(
    () => (model ? buildScopedControls(viewId, model) : []),
    [model, viewId]
  );
  const groups = useMemo(
    () => buildControlGroups(scopedControls),
    [scopedControls]
  );
  const [expandedGroupState, setExpandedGroupState] = useState<ExpandedGroupState>(
    () => ({
      viewId,
      groupKeys: new Set(),
    })
  );
  const expandedGroupKeys =
    expandedGroupState.viewId === viewId
      ? expandedGroupState.groupKeys
      : EMPTY_EXPANDED_GROUP_KEYS;
  const activeControl = useMemo(
    () =>
      activeControlId
        ? scopedControls.find(
            (control) => control.definition.controlId === activeControlId
          )?.definition ?? null
        : null,
    [activeControlId, scopedControls]
  );
  const toggleGroup = (groupKey: OverviewGroupKey) => {
    setExpandedGroupState((current) => {
      const currentGroupKeys =
        current.viewId === viewId ? current.groupKeys : EMPTY_EXPANDED_GROUP_KEYS;
      const next = new Set(currentGroupKeys);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return {
        viewId,
        groupKeys: next,
      };
    });
  };
  const handleOverviewSwipe = useCallback(
    (direction: "previous" | "next"): boolean => {
      const targetView = getSiblingViewId(model, viewId, direction);
      if (!targetView) {
        return false;
      }

      onCloseControl();
      setCurrentView(targetView);
      setMobileDockOpen(false);
      return true;
    },
    [model, onCloseControl, setCurrentView, viewId]
  );
  const handleOverviewPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        allowLocationViewSwitch ||
        mobileDockOpen ||
        activeControlId ||
        !isPrimaryPointer(event) ||
        isOverviewSwipeBlockedTarget(event.target)
      ) {
        overviewSwipeGestureRef.current = null;
        return;
      }

      overviewSwipeGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        handledSwipe: false,
      };
    },
    [activeControlId, allowLocationViewSwitch, mobileDockOpen]
  );
  const handleOverviewPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const gesture = overviewSwipeGestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId || gesture.handledSwipe) {
        return;
      }

      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (
        absX < POINTER_SWIPE_MIN_DISTANCE_PX ||
        absX < absY * POINTER_HORIZONTAL_SWIPE_FACTOR
      ) {
        return;
      }

      gesture.handledSwipe = true;
      handleOverviewSwipe(deltaX < 0 ? "next" : "previous");
    },
    [handleOverviewSwipe]
  );
  const handleOverviewPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (overviewSwipeGestureRef.current?.pointerId === event.pointerId) {
        overviewSwipeGestureRef.current = null;
      }
    },
    []
  );

  return (
    <>
      <MobileTopDock
        open={mobileDockOpen}
        viewLabel={viewLabel}
        onClose={() => {
          setMobileDockOpen(false);
        }}
        onViewChange={(nextViewId) => {
          onCloseControl();
          setCurrentView(nextViewId);
          setMobileDockOpen(false);
        }}
      />
      <main
        data-testid={`${viewId}-overview`}
        data-prevent-dock-open="true"
        onPointerDown={handleOverviewPointerDown}
        onPointerMove={handleOverviewPointerMove}
        onPointerUp={handleOverviewPointerEnd}
        onPointerCancel={handleOverviewPointerEnd}
        className="pointer-events-auto absolute inset-0 z-30 overflow-y-auto px-3 pb-8 pt-0 text-ui-foreground md:px-6 md:pb-10 md:pt-6"
        style={{ touchAction: allowLocationViewSwitch ? undefined : "pan-y" }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-5 md:gap-8">
          <header className="sticky top-0 z-20 -mx-3 flex items-center justify-between gap-3 px-3 py-3 backdrop-blur-md md:static md:mx-0 md:px-0 md:py-0 md:backdrop-blur-0">
            {allowLocationViewSwitch ? (
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold leading-tight text-ui-foreground [overflow-wrap:anywhere] [text-shadow:0_2px_10px_var(--color-ui-shadow-text)] md:text-4xl">
                  {viewLabel}
                </h1>
              </div>
            ) : (
              <button
                type="button"
                data-testid="mobile-top-dock-toggle"
                aria-expanded={mobileDockOpen}
                onClick={() => {
                  setMobileDockOpen((current) => !current);
                }}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-left text-ui-foreground md:hidden"
                aria-label="Raumnavigation öffnen"
              >
                <span className="min-w-0 break-words text-2xl font-bold leading-tight [overflow-wrap:anywhere] [text-shadow:0_2px_10px_var(--color-ui-shadow-text)]">
                  {viewLabel}
                </span>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ui-border-subtle bg-ui-surface-overlay/70 shadow-[0_8px_28px_var(--color-ui-shadow-panel)] backdrop-blur-md">
                  <MdKeyboardArrowDown className="h-7 w-7" />
                </span>
              </button>
            )}
            {allowLocationViewSwitch ? (
              <button
                type="button"
                data-testid="overview-switch-to-location"
                onClick={onSwitchToLocationView}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-ui-border-subtle bg-ui-surface-overlay/70 px-3 text-sm font-bold text-ui-foreground shadow-[0_8px_28px_var(--color-ui-shadow-panel)] backdrop-blur-md transition hover:bg-ui-surface-muted md:min-w-0"
                aria-label={`${viewLabel} Location-View öffnen`}
              >
                <MdSpaceDashboard className="h-5 w-5" />
                <span className="hidden md:inline">View</span>
              </button>
            ) : null}
          </header>

          {!allowLocationViewSwitch ? (
            <MobileOverviewStateGrid
              viewId={viewId}
              activeControlId={activeControlId}
              onOpenControl={onOpenControl}
              onCloseControl={onCloseControl}
            />
          ) : null}

          {groups.length === 0 ? (
            <section className="pt-8 text-ui-foreground [text-shadow:0_2px_8px_var(--color-ui-shadow-text)]">
              <p className="text-base font-semibold">Keine Controls gefunden.</p>
              <p className="mt-1 text-sm text-ui-foreground-muted">
                Für diese Location sind aktuell keine steuerbaren Items zugeordnet.
              </p>
            </section>
          ) : (
            <div className="flex flex-col gap-5 md:gap-8">
              {groups.map((group, index) => (
                <section
                  key={group.groupKey}
                  data-testid={`overview-group-${group.groupKey}`}
                  className={`pt-5 ${
                    index === 0 ? "" : "border-t border-ui-border-subtle"
                  }`}
                >
                  {(() => {
                    const expanded = expandedGroupKeys.has(group.groupKey);
                    const ExpandIcon = expanded ? MdExpandLess : MdExpandMore;

                    return (
                      <>
                        <button
                          type="button"
                          data-testid={`overview-group-toggle-${group.groupKey}`}
                          aria-expanded={expanded}
                          onClick={() => {
                            toggleGroup(group.groupKey);
                          }}
                          className="flex w-full items-center justify-between gap-3 text-left text-ui-foreground transition hover:brightness-110"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xl font-black leading-tight text-ui-foreground [text-shadow:0_2px_10px_var(--color-ui-shadow-text)] md:text-3xl">
                              {formatGroupTitle(group)}
                            </span>
                          </span>
                          <ExpandIcon className="h-7 w-7 shrink-0 text-ui-foreground md:h-8 md:w-8" />
                        </button>

                        <div className="mt-3">
                          <AggregateActions group={group} />
                        </div>

                        {expanded ? (
                          <div
                            data-testid={`overview-group-controls-${group.groupKey}`}
                            data-layout={group.expandedLayout}
                            className={getExpandedControlsClassName(
                              group.expandedLayout
                            )}
                          >
                            {group.controls.map((control) => (
                              <OverviewControlItem
                                key={control.definition.controlId}
                                control={control}
                                layout={group.expandedLayout}
                                onOpenControl={onOpenControl}
                              />
                            ))}
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {renderOverlayControl(activeControl, onCloseControl)}
    </>
  );
};

export default OverviewView;
