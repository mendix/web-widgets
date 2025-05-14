import { SortInstruction } from "./typings";

export interface ObservableSortStore {
    sortOrder: SortInstruction[];
}

export interface ObservableSortStoreHost {
    sortOrder: SortInstruction[];
    observe: (key: string, store: ObservableSortStore) => void;
    unobserve: (key: string) => void;
}
