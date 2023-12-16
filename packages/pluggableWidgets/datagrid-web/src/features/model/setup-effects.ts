import { ListValue } from "mendix";
import { sample, Event, combine, Store, createStore } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Model, Status } from "./base";
import { sortToInst, stateToSettings } from "./utils";
import * as Grid from "../../typings/GridModel";
import { ModelEffects } from "./effects";

type Props = DatagridContainerProps;

export function setupEffects(
    propsUpdated: Event<Props>,
    grid: Model,
    events: Grid.Events,
    status: Store<Status>,
    effects: ModelEffects
): void {
    const isReady = status.map(status => status === "ready");
    const $ds = createStore<ListValue | null>(null).on(propsUpdated, (_, props) => props.datasource);
    const datasourceUpdated = $ds.updates.filterMap(value => {
        return value !== null ? value : undefined;
    });

    sample({
        source: propsUpdated,
        target: effects.setupDatasourceFx
    });

    sample({
        clock: sample({ clock: events.limitChanged, filter: isReady }),
        // Take latest datasource
        source: datasourceUpdated,
        filter: (ds, limit) => {
            if (limit > ds.limit) {
                return !!ds.hasMoreItems;
            }
            return limit >= 0;
        },
        fn: (ds, limit) => [ds, limit] as const,
        target: effects.updateLimitFx
    });

    sample({
        clock: sample({ clock: events.offsetChanged, filter: isReady }),
        source: datasourceUpdated,
        filter: (ds, offset) => {
            if (offset > ds.offset) {
                return !!ds.hasMoreItems;
            }
            return offset >= 0;
        },
        fn: (ds, offset) => [ds, offset] as const,
        target: effects.updateOffsetFx
    });

    const $sortInstructions = combine(grid.columns, grid.sort, (cols, sort) => sortToInst(sort, cols));
    sample({
        clock: $sortInstructions,
        source: datasourceUpdated,
        filter: isReady,
        fn: (ds, inst) => [ds, inst] as const,
        target: effects.updateOrderFx
    });

    sample({
        clock: grid.filter,
        filter: isReady,
        source: datasourceUpdated,
        fn: (ds, filter) => [ds, filter] as const,
        target: effects.updateFilterFx
    });

    const $settings = combine<Grid.StorableState>({
        columns: grid.columns,
        hidden: grid.hidden,
        name: grid.name,
        order: grid.order,
        settingsHash: grid.settingsHash,
        size: grid.size,
        sort: grid.sort
    }).map(stateToSettings);

    sample({
        clock: $settings,
        source: grid.storage,
        filter: isReady,
        fn: (storage, settings) => [settings, storage] as const,
        target: effects.writeSettingsFx
    });

    sample({
        clock: propsUpdated,
        source: datasourceUpdated,
        filter: isReady,
        fn: (ds, props) => [ds, props.refreshInterval] as const,
        target: effects.refreshFx
    });
}
