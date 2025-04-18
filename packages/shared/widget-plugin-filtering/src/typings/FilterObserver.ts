import { FilterData, FiltersSettingsMap } from "@mendix/filter-commons/typings/settings";
import { FilterCondition } from "mendix/filters";

export interface Filter {
    toJSON(): FilterData;
    fromJSON(data: FilterData): void;
    condition: FilterCondition | undefined;
    setup?: () => void | void;
}

export interface FilterObserver {
    get settings(): FiltersSettingsMap<string>;
    set settings(settings: FiltersSettingsMap<string>);
    conditions: Array<FilterCondition | undefined>;
    observe(key: string, filter: Filter): void;
    unobserve(key: string): void;
}
