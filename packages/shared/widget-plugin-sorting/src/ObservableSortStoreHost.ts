import { SortInstruction } from "./SortingStoreInterface";

export interface ObservableSortStore {
    sortOrder: SortInstruction | null;
    setup?: () => void | void;
}

export interface ObservableSortStoreHost {
    sortOrder: SortInstruction[];
    observe: (store: ObservableSortStore, key: string) => void;
    unobserve: (store: ObservableSortStore) => void;
}
