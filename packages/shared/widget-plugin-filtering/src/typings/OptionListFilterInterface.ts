export interface Option<T> {
    caption: string;
    value: T;
    selected: boolean;
}

export interface CustomOption<T> {
    caption: string;
    value: T;
}

export interface OptionListFilterInterface<T> {
    type: "refselect" | "select";
    storeType: "optionlist";
    options: Array<Option<T>>;
    isLoading: boolean;
    hasMore: boolean;
    hasSearch: boolean;
    selectedCount?: number;
    replace(value: T[]): void;
    toggle(value: T): void;
    loadMore(): void;
    setSearch(term: string | undefined): void;
    isValidValue(value: string): boolean;
    reset(): void;
    clear(): void;
    UNSAFE_setDefaults(value?: string[]): void;
    setup?(): () => void | void;
    setCustomOptions(options: Array<CustomOption<T>>): void;
}
