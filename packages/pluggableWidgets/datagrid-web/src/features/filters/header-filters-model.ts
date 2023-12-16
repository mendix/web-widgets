import { FilterState, FilterType } from "@mendix/widget-plugin-filtering";
import { Event, Store, createEvent, createStore, sample } from "effector";
import { Filter, SetHeaderFilter } from "../../typings/GridModel";
import { reduceFiltersMap, unzipFilter } from "./utils";
import { InitParams } from "../model/base";

type HeaderFilters = Map<FilterType, FilterState>;

export function createHeaderFilters(
    _paramsReady: Event<InitParams>
): [composedFilter: Store<Filter>, setFilter: SetHeaderFilter] {
    const setFilter = createEvent<FilterState>();

    const $filters = createStore<HeaderFilters>(new Map()).on(setFilter, (state, filterState) => {
        if (!filterState.filterType) {
            return state;
        }
        if (Object.is(state.get(filterState.filterType), filterState)) {
            return state;
        }
        const next = new Map(state);
        next.set(filterState.filterType, filterState);
        return next;
    });

    const $composedFilter = sample({
        source: $filters,
        fn: reduceFiltersMap,
        target: createStore<Filter>(undefined, { skipVoid: false })
    });

    // console.log(typeof unzipFilter);

    $composedFilter.on(_paramsReady, (_, { filter }) => {
        const [, initFilter] = unzipFilter(filter);
        return initFilter;
    });

    return [$composedFilter, setFilter];
}
