import { Context, createContext, useContext } from "react";
import { APIError } from "./errors";
import { ObservableSortStoreHost } from "./observable-sort-host";
import { Result, error, value } from "./result-meta";

export interface SortAPI {
    version: 1;
    store: Result<ObservableSortStoreHost, APIError>;
}

const SORT_PATH = "com.mendix.widgets.web.sortable.sortContext";

export function getGlobalSortContext(): Context<SortAPI | null> {
    return ((window as any)[SORT_PATH] ??= createContext<SortAPI | null>(null));
}

export function useSortAPI(): Result<SortAPI, APIError> {
    const api = useContext(getGlobalSortContext());
    return api === null ? error({ code: "", message: "Out of context" }) : value(api);
}
