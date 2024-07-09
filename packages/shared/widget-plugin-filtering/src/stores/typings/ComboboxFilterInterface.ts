import { FilterCondition } from "mendix/filters";

export type Option<T> = {
    caption: string;
    value: T;
    selected: boolean;
};

export interface BaseComboboxFilter<T> {
    controlType: "combobox";
    filterCondition: FilterCondition | undefined;
    value: Set<T>;
    options: Array<Option<T>>;
    isLoading: boolean;
    hasMore: boolean;
    replace(value: T[]): void;
    toggle(value: T): void;
    loadMore(): void;
    setSearch(term: string): void;
    isValidValue(value: string): boolean;
}

export interface SelectOnlyFilter extends BaseComboboxFilter<string> {
    valueType: "listbox";
}

export interface RefFilter extends BaseComboboxFilter<string> {
    valueType: "reflistbox";
}

export type ComboboxFilterInterface = SelectOnlyFilter | RefFilter;
