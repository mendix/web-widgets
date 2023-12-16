import { FilterState } from "@mendix/widget-plugin-filtering";
import { createEvent, createStore, Store, sample, Event } from "effector";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { reduceFiltersMap, unzipFilter } from "./utils";
import { Filter, SetColumnFilter } from "../../typings/GridModel";
import { InitParams } from "../model/base";

type ColumnFilters = Map<ColumnId, FilterState>;

export function createColumnFilters(
    visible: Store<GridColumn[]>,
    paramsReady: Event<InitParams>
): [filter: Store<Filter>, setFilter: SetColumnFilter] {
    const setColumnFilter = createEvent<[ColumnId, FilterState]>();

    const $filters = createStore<ColumnFilters>(new Map())
        .on(setColumnFilter, (state, [id, filterState]) => {
            if (Object.is(state.get(id), filterState)) {
                return state;
            }
            const next = new Map(state);
            next.set(id, filterState);
            return next;
        })
        .on(visible.updates, (state, visible) => {
            const visibleIds = new Set(visible.map(x => x.columnId));
            const next = new Map([...state].filter(([id]) => visibleIds.has(id)));

            return state.size === next.size ? state : next;
        });

    const $composedFilter = sample({
        source: $filters,
        fn: reduceFiltersMap,
        target: createStore<Filter>(undefined, { skipVoid: false })
    });

    $composedFilter.on(paramsReady, (_, { filter }) => {
        const [initFilter] = unzipFilter(filter);
        return initFilter;
    });

    return [$composedFilter, setColumnFilter];
}
