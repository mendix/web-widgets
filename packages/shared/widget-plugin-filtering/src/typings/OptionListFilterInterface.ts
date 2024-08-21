export interface Option<T> {
    caption: string;
    value: T;
    selected: boolean;
}

export interface CustomOption<T> {
    caption: string;
    value: T;
}

export interface OptionListFilterInterface {
    type: "refselect" | "select";
    storeType: "optionlist";
    options: Array<Option<string>>;
    isLoading: boolean;
    hasMore: boolean;
    hasSearch: boolean;
    selectedCount?: number;
    replace(value: string[]): void;
    toggle(value: string): void;
    loadMore(): void;
    setSearch(term: string | undefined): void;
    isValidValue(value: string): boolean;
    reset(): void;
    clear(): void;
    UNSAFE_setDefaults(value?: string[]): void;
    setup?(): () => void | void;
    setCustomOptions(options: Array<CustomOption<string>>): void;
}
