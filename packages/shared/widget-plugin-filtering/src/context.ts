import { FilterCondition } from "mendix/filters/index.js";
import { Context, createContext, useContext } from "react";
import { APIError, ENOCONTEXT } from "./errors.js";
import { Result, error, value } from "./result-meta.js";
import { FilterObserver } from "./typings/FilterObserver.js";
import { InputFilterInterface } from "./typings/InputFilterInterface.js";
import { PickerFilterStore } from "./typings/PickerFilterStore.js";

export interface FilterAPI {
    version: 3;
    parentChannelName: string;
    provider: Result<FilterStoreProvider, APIError>;
    filterObserver: FilterObserver;
    sharedInitFilter: Array<FilterCondition | undefined>;
}

/** @deprecated */
export enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date"
}

export type FilterStoreProvider = DirectProvider | LegacyProvider;

export type FilterStore = InputFilterInterface | PickerFilterStore;

interface DirectProvider {
    type: "direct";
    store: FilterStore | null;
}

/** @deprecated */
export interface LegacyProvider {
    type: "legacy";
    get: (type: FilterType) => FilterStore | null;
}

type FilterAPIContext = Context<FilterAPI | null>;

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.filterable.filterContext.v2" as const;

declare global {
    interface Window {
        [CONTEXT_OBJECT_PATH]: FilterAPIContext | undefined;
    }
}

export function getGlobalFilterContextObject(): FilterAPIContext {
    return (window[CONTEXT_OBJECT_PATH] ??= createContext<FilterAPI | null>(null));
}

export function useFilterAPI(): Result<FilterAPI, APIError> {
    const context = getGlobalFilterContextObject();
    const contextValue = useContext(context);

    if (contextValue == null) {
        return error(ENOCONTEXT);
    }

    return value(contextValue);
}

/** @deprecated This hook is renamed, use `useFilterAPI` instead. */
export const useFilterContextValue = useFilterAPI;

export function getFilterStore(provider: FilterStoreProvider, legacyType: FilterType): FilterStore | null {
    switch (provider.type) {
        case "direct":
            return provider.store;
        case "legacy":
            return provider.get(legacyType);
        default:
            return null;
    }
}
