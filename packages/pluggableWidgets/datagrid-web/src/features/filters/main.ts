import { Event, Store, createStore, sample } from "effector";
import { GridColumn } from "../../typings/GridColumn";
import { Filter, SetColumnFilter, SetHeaderFilter } from "../../typings/GridModel";
import { InitParams } from "../model/base";
import { createColumnFilters } from "./column-filters-model";
import { createHeaderFilters } from "./header-filters-model";
import { reduceFilters } from "./utils";

export function createFilter(
    paramsReady: Event<InitParams>,
    visible: Store<GridColumn[]>
): [filter: Store<Filter>, setColumnFilter: SetColumnFilter, setHeaderFilter: SetHeaderFilter] {
    const [$columnFilters, setColumnFilter] = createColumnFilters(visible);
    const [$headerFilters, setHeaderFilter] = createHeaderFilters();

    $columnFilters.updates.watch(v => console.log("DEBUG column filter updates changed", v));
    $headerFilters.updates.watch(v => console.log("DEBUG header filter updates changed", v));

    const $filter = createStore<Filter>(undefined, { skipVoid: false }).on(paramsReady, (_, params) => params.filter);

    sample({
        source: [$columnFilters, $headerFilters] as const,
        // TODO: If one of filters is undefined
        // we can replace it with "placeholder": eq(true, true)
        // This "placeholder" is needed to restore filter values later.
        fn: ([columnFilters, headerFilters]) => {
            return reduceFilters([columnFilters, headerFilters]);
        },
        target: $filter
    });

    return [$filter, setColumnFilter, setHeaderFilter];
}
