import { ListValue } from "mendix";
import { clearNode, createEffect, sample, Event, combine, Store } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { GridModel, Status } from "./base";
import { sortToInst, stateToSettings } from "./utils";
import * as Grid from "../../typings/GridState";
import { GridSettings } from "../../typings/GridSettings";
import { DynamicStorage } from "../storage/base";

type Props = DatagridContainerProps;

export function setupEffects(propsUpdated: Event<Props>, grid: GridModel, status: Store<Status>): void {
    const setupDatasourceFx = sample({
        source: propsUpdated,
        target: createEffect((props: DatagridContainerProps) => {
            props.datasource.setLimit(props.pageSize);
            if (props.pagination === "buttons") {
                props.datasource.requestTotalCount(props.datasource.hasMoreItems ?? false);
            }
            // Preventing calling this effect on future updates.
            clearNode(setupDatasourceFx);
        })
    });

    const datasource = sample({
        clock: propsUpdated,
        source: status,
        // Allow datasource changes only once state is initialized
        filter: status => status === "ready",
        fn: (_, props) => props.datasource
    });

    const updateLimitFx = createEffect(([ds, limit]: [ListValue, number]) => ds.setLimit(limit));
    const updateOffsetFx = createEffect(([ds, offset]: [ListValue, number]) => ds.setOffset(offset));
    const updateOrderFx = createEffect(([ds, order]: [ListValue, ListValue["sortOrder"]]) => ds.setSortOrder(order));

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
        target: updateLimitFx
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
        target: updateOffsetFx
    });

    const $inst = combine(grid.columns, grid.sort, (cols, sort) => sortToInst(sort, cols));
    sample({
        clock: $inst,
        source: datasource,
        fn: (ds, inst) => [ds, inst] as const,
        target: updateOrderFx
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
        source: [status, $settings, grid.storage] as const,
        filter: ([status]) => status === "ready",
        fn: ([_, ...params]) => params,
        target: createEffect(([settings, storage]: [GridSettings, DynamicStorage]) => {
            // console.log(JSON.stringify(stateToSettings(state), null, 2));
            if (storage.status !== "ready") {
                return;
            }
            storage.value.save(settings);
        })
    });
}
