import { FilterState, FilterType } from "@mendix/widget-plugin-filtering";
import { action, makeObservable, observable } from "mobx";
import { FilterCondition } from "mendix/filters";

export class HeaderFiltersStore {
    private filters: Record<FilterType, FilterState | undefined> = {
        [FilterType.STRING]: undefined,
        [FilterType.NUMBER]: undefined,
        [FilterType.DATE]: undefined,
        [FilterType.ENUMERATION]: undefined,
        [FilterType.ASSOCIATION]: undefined
    };

    isDirty = false;

    constructor() {
        makeObservable<typeof this, "filters">(this, {
            filters: observable.struct,

            isDirty: observable,

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

    setDirty(): void {
        this.isDirty = true;
    }
}
