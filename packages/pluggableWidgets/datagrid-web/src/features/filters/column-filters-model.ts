import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { FilterState } from "@mendix/widget-plugin-filtering";
import { createEvent, createStore, Store, EventCallable, sample } from "effector";
import { ColumnId, GridColumn } from "../../typings/GridColumn";

type ColumnFilters = Map<ColumnId, FilterState>;

export function createColumnFilters(
    visible: Store<GridColumn[]>
): [query: Store<FilterCondition | undefined>, setColumnFilter: EventCallable<[ColumnId, FilterState]>] {
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

    const $finalFilter = sample({
        source: $filters,
        fn: filters => {
            const conditions = [...filters].flatMap(([_, state]) => {
                const value = state.getFilterCondition();
                return value ? [value] : [];
            });

            switch (conditions.length) {
                case 0:
                    return undefined;
                case 1:
                    return conditions[0];
                default:
                    return and(...conditions);
            }
        },
        target: createStore<FilterCondition | undefined>(undefined, { skipVoid: false })
    });

    return [$finalFilter, setColumnFilter];
}
