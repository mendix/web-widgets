import { FilterData, FiltersSettingsMap } from "@mendix/filter-commons/typings/settings";
import { FilterCondition } from "mendix/filters";

export interface Filter {
    toJSON(): FilterData;
    fromJSON(data: FilterData): void;
    fromViewState(data: FilterCondition): void;
    condition: FilterCondition | undefined;
    setup?: () => void | void;
}

export interface ObservableFilterHost {
    get settings(): FiltersSettingsMap<string>;
    set settings(settings: FiltersSettingsMap<string>);
    observe(key: string, filter: Filter): void;
    unobserve(key: string): void;
}
