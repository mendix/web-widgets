import { Event, Store, createStore, sample } from "effector";
import { GridColumn } from "../../typings/GridColumn";
import { Filter, SetColumnFilter, SetHeaderFilter } from "../../typings/GridModel";
import { InitParams } from "../model/base";
import { createColumnFilters } from "./column-filters-model";
import { createHeaderFilters } from "./header-filters-model";
import { zipFilters } from "./utils";

type ReturnFilters = {
    filter: Store<Filter>;
    splitFilter: Store<[columns: Filter, header: Filter]>;
};

export function createFilter(
    paramsReady: Event<InitParams>,
    visible: Store<GridColumn[]>
): [filters: ReturnFilters, setColumnFilter: SetColumnFilter, setHeaderFilter: SetHeaderFilter] {
    const [$columnFilters, setColumnFilter] = createColumnFilters(visible, paramsReady);
    const [$headerFilters, setHeaderFilter] = createHeaderFilters(paramsReady);

    const $splitFilter = createStore<[columns: Filter, header: Filter]>([undefined, undefined], { skipVoid: false });

    sample({
        source: [$columnFilters, $headerFilters] as const,
        target: $splitFilter
    });

    const $filter = $splitFilter.map(([a, b]) => zipFilters(a, b));

    return [{ filter: $filter, splitFilter: $splitFilter }, setColumnFilter, setHeaderFilter];
}
