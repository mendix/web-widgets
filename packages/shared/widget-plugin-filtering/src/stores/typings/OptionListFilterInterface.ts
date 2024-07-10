export type Option<T> = {
    caption: string;
    value: T;
    selected: boolean;
};

export interface OptionListFilterInterface<T> {
    storeType: "optionlist";
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
