import { FilterContextValue, FilterState, FilterType, readInitFilterValues } from "@mendix/widget-plugin-filtering";
import { action, computed, makeObservable, observable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { FilterListType } from "../../../typings/DatagridProps";

export class HeaderFiltersStore {
    private filters: Record<FilterType, FilterState | undefined> = {
        [FilterType.STRING]: undefined,
        [FilterType.NUMBER]: undefined,
        [FilterType.DATE]: undefined,
        [FilterType.ENUMERATION]: undefined,
        [FilterType.ASSOCIATION]: undefined
    };

    isDirty = false;

    constructor(private initialFilters: FilterCondition | undefined, private filterList: FilterListType[]) {
        makeObservable<typeof this, "filters">(this, {
            filters: observable,
            isDirty: observable,

            conditions: computed.struct,

            setFilter: action,
            setDirty: action
        });
    }

    setFilter(type: FilterType, filter: FilterState | undefined) {
        this.filters[type] = filter;
    }

    get conditions(): FilterCondition[] {
        return Object.keys(this.filters)
            .map((key: FilterType) => this.filters[key]?.getFilterCondition?.())
            .filter((filter): filter is FilterCondition => filter !== undefined);
    }

    get multipleInitialFilters(): FilterContextValue["multipleInitialFilters"] {
        return this.filterList.reduce(
            (filters, { filter }) => ({
                ...filters,
                [filter.id]: readInitFilterValues(filter, this.initialFilters)
            }),
            {}
        );
    }

    get multipleAttributes(): FilterContextValue["multipleAttributes"] {
        return this.filterList.reduce((filters, { filter }) => ({ ...filters, [filter.id]: filter }), {});
    }

    setDirty(): void {
        this.isDirty = true;
    }
}
