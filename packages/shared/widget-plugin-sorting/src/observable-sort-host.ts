import { SortInstruction } from "./typings";

export interface ObservableSortStore {
    sortOrder: SortInstruction[];
}

export interface SortingStoreObserver extends ObservableSortStore {
    observe: (key: string, store: ObservableSortStore) => void;
    unobserve: (key: string) => void;
}
