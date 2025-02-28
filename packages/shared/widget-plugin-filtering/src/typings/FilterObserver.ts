import { FilterCondition } from "mendix/filters";
import { FilterData, FiltersSettingsMap } from "./settings";

export interface Filter {
    toJSON(): FilterData;
    fromJSON(data: FilterData): void;
    condition: FilterCondition | undefined;
}

export interface FilterObserver {
    get settings(): FiltersSettingsMap<string>;
    set settings(settings: FiltersSettingsMap<string>);
    condition: Array<FilterCondition | undefined>;
    observe(key: string, filter: Filter): void;
    unobserve(key: string): void;
}
