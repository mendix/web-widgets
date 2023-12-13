import { ListValue } from "mendix";
import { clearNode, createEffect, sample, Event, combine } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { GridModel } from "./base";
import { sortToInst } from "./utils";

type Props = DatagridContainerProps;

export function setupEffects(propsUpdated: Event<Props>, grid: GridModel): void {
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

    const datasource = propsUpdated.map(props => props.datasource);
    const updateLimitFx = createEffect(([ds, limit]: [ListValue, number]) => ds.setLimit(limit));
    const updateOffsetFx = createEffect(([ds, offset]: [ListValue, number]) => ds.setOffset(offset));
    const updateOrderFx = createEffect(([ds, order]: [ListValue, ListValue["sortOrder"]]) => ds.setSortOrder(order));

    sample({
        clock: grid.limitChanged,
        // Take latest datasource
        source: datasource,
        fn: (ds, limit) => [ds, Math.max(limit, 0)] as const,
        target: updateLimitFx
    });

    sample({
        clock: grid.offsetChanged,
        source: datasource,
        fn: (ds, offset) => [ds, Math.max(offset, 0)] as const,
        target: updateOffsetFx
    });

    const $inst = combine(grid.columns, grid.sort, (cols, sort) => sortToInst(sort, cols));
    sample({
        clock: $inst,
        source: datasource,
        fn: (ds, inst) => [ds, inst] as const,
        target: updateOrderFx
    });
}
