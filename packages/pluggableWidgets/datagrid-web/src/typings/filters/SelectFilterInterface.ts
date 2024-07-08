import { FilterCondition } from "mendix/filters";

// interface DynamicSelectOptionsInterface<T> {
//     options: T[];
//     // should support lazy loading
//     isLoading: boolean; // ?
//     // isFetched: boolean; // ?
//     hasMore: boolean; // ?
//     loadMore: () => void; //?
// }

// interface StaticSelectOptionsInterface<T> {
//     options: T[];
// }

// export interface EnumBool_SingleSelectFilterInterface extends StaticSelectOptionsInterface<string> {
//     type: "single";
//     value: string | undefined;

//     getCaption: (val: string) => string;

//     reset(): void;
// }

// export interface EnumBool_MultiSelectFilterInterface extends StaticSelectOptionsInterface<string> {
//     type: "multi";
//     value: string[];

//     getCaption: (val: string) => string;

//     reset(): void;
// }

// export interface Association_SingleSelectFilterInterface extends DynamicSelectOptionsInterface<string> {
//     type: "single";
//     value: string | undefined;

//     getCaption: (val: string) => string;

//     reset(): void;
// }

// export interface Association_MultiSelectFilterInterface extends DynamicSelectOptionsInterface<string> {
//     type: "multi";
//     value: string;

//     getCaption: (val: string) => string;

//     reset(): void;
// }

// export type SelectFilterInterface =
//     | EnumBool_SingleSelectFilterInterface
//     | EnumBool_MultiSelectFilterInterface
//     | Association_SingleSelectFilterInterface
//     | Association_MultiSelectFilterInterface;
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
    type: "listbox";
}

export interface RefFilter extends BaseComboboxFilter<string> {
    type: "reflistbox";
}

export type ComboboxFilter = SelectOnlyFilter | RefFilter;
