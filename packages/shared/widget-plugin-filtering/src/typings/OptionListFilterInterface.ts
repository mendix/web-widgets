export interface Option {
    caption: string;
    value: string;
    selected: boolean;
}

export interface CustomOption {
    caption: string;
    value: string;
}

export interface OptionListFilterInterface {
    type: "refselect" | "select";
    storeType: "optionlist";
    options: Option[];
    isLoading: boolean;
    hasMore: boolean;
    canSearch: boolean;
    selectedCount?: number;
    searchBuffer: string;
    replace(value: string[]): void;
    toggle(value: string): void;
    loadMore(): void;
    setSearch(term: string | undefined): void;
    isValidValue(value: string): boolean;
    reset(): void;
    clear(): void;
    UNSAFE_setDefaults(value?: string[]): void;
    setup?(): () => void | void;
    setCustomOptions(options: CustomOption[]): void;
}
