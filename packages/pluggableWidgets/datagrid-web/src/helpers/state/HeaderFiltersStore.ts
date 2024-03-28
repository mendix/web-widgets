import { FilterContextValue, FilterState, FilterType, readInitFilterValues } from "@mendix/widget-plugin-filtering";
import { action, computed, makeObservable, observable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { DatagridContainerProps, FilterListType } from "../../../typings/DatagridProps";

export class HeaderFiltersStore {
    isDirty = false;

    private initialFilters: FilterCondition | undefined;
    private filterList: FilterListType[];
    private filters: Record<FilterType, FilterState | undefined> = {
        [FilterType.STRING]: undefined,
        [FilterType.NUMBER]: undefined,
        [FilterType.DATE]: undefined,
        [FilterType.ENUMERATION]: undefined,
        [FilterType.ASSOCIATION]: undefined
    };

    constructor(props: Pick<DatagridContainerProps, "datasource" | "filterList">) {
        this.initialFilters = props.datasource.filter;
        this.filterList = props.filterList;

        makeObservable<typeof this, "filters">(this, {
            filters: observable,
            isDirty: observable,

            filterConditions: computed.struct,

            setFilterState: action,
            setDirty: action
        });
    }

    setFilterState(type: FilterType, filter: FilterState | undefined): void {
        this.filters[type] = filter;
    }

    get filterConditions(): FilterCondition[] {
        return Object.keys(this.filters)
            .map((key: FilterType) => this.filters[key]?.getFilterCondition?.())
            .filter((filter): filter is FilterCondition => filter !== undefined);
    }

    getFilterContextProps(): Pick<FilterContextValue, "multipleAttributes" | "multipleInitialFilters"> {
        const multipleAttributes = this.filterList.reduce(
            (filters, { filter }) => ({ ...filters, [filter.id]: filter }),
            {}
        );
        const multipleInitialFilters = this.filterList.reduce(
            (filters, { filter }) => ({
                ...filters,
                [filter.id]: readInitFilterValues(filter, this.initialFilters)
            }),
            {}
        );
        return {
            multipleAttributes,
            multipleInitialFilters
        };
    }

    setDirty(): void {
        this.isDirty = true;
    }
}
