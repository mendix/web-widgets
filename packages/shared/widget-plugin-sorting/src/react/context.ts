import { Context, createContext, useContext } from "react";
import { SortStoreHost } from "../stores/SortStoreHost";
import { SortInstruction } from "../types/store";

export interface SortAPI {
    version: 1;
    host: SortStoreHost;
    initSortOrder?: SortInstruction[];
}

const SORT_PATH = "com.mendix.widgets.web.sortable.sortContext";

export function getGlobalSortContext(): Context<SortAPI | null> {
    return ((window as any)[SORT_PATH] ??= createContext<SortAPI | null>(null));
}

export function useSortAPI(): SortAPI {
    const api = useContext(getGlobalSortContext());
    if (api === null) {
        throw new Error("SortAPI is not available. Widget is out of parent context.");
    }
    return api;
}
