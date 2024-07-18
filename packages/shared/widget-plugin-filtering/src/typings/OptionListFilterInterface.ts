export type Option<T> = {
    caption: string;
    value: T;
    selected: boolean;
};

export interface OptionListFilterInterface<T> {
    storeType: "optionlist";
    options: Array<Option<T>>;
    isLoading: boolean;
    hasMore: boolean;
    hasSearch: boolean;
    replace(value: T[]): void;
    toggle(value: T): void;
    loadMore(): void;
    setSearch(term: string | undefined): void;
    isValidValue(value: string): boolean;
}
