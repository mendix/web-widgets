import { sample, Event, combine, Store } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { GridModel, Status } from "./base";
import { sortToInst, stateToSettings } from "./utils";
import * as Grid from "../../typings/GridState";
import { ModelEffects } from "./effects";

type Props = DatagridContainerProps;

export function setupEffects(
    propsUpdated: Event<Props>,
    grid: GridModel,
    status: Store<Status>,
    effects: ModelEffects
): void {
    const datasource = sample({
        clock: propsUpdated,
        source: status,
        // Allow datasource change events once state is initialized
        filter: status => status === "ready",
        fn: (_, props) => props.datasource
    });

    sample({
        source: propsUpdated,
        target: effects.setupDatasourceFx
    });

    sample({
        clock: grid.limitChanged,
        // Take latest datasource
        source: datasource,
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
        clock: grid.offsetChanged,
        source: datasource,
        filter: (ds, offset) => {
            if (offset > ds.offset) {
                return !!ds.hasMoreItems;
            }
            return offset >= 0;
        },
        fn: (ds, offset) => [ds, offset] as const,
        target: effects.updateOffsetFx
    });

    const $inst = combine(grid.columns, grid.sort, (cols, sort) => sortToInst(sort, cols));
    sample({
        clock: $inst,
        source: datasource,
        fn: (ds, inst) => [ds, inst] as const,
        target: effects.updateOrderFx
    });

    const $settings = combine<Grid.StorableState>({
        columns: grid.columns,
        settingsHash: grid.settingsHash,
        hidden: grid.hidden,
        order: grid.order,
        size: grid.size,
        sort: grid.sort
    }).map(stateToSettings);

    sample({
        clock: $settings,
        source: [status, grid.storage] as const,
        filter: ([status]) => status === "ready",
        fn: ([_, storage], settings) => [settings, storage] as const,
        target: effects.writeSettingsFx
    });
}
