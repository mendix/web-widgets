import { SortInstruction } from "./SortingStoreInterface";

export interface ObservableSortStore {
    sortOrder: SortInstruction[];
    setup?: () => void | void;
}

export interface ObservableSortStoreHost {
    sortOrder: SortInstruction[];
    observe: (key: string, store: ObservableSortStore) => void;
    unobserve: (key: string) => void;
}
