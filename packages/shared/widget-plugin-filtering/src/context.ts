import { Context, createContext, useContext } from "react";
import { APIError, ENOCONTEXT } from "./errors.js";
import { Result, error, value } from "./result-meta.js";
import { InputFilterInterface } from "./typings/InputFilterInterface.js";
import { PickerFilterStore } from "./typings/PickerFilterStore.js";

export interface FilterAPI {
    version: 2;
    parentChannelName: string;
    provider: Result<FilterStoreProvider, APIError>;
}

/** @deprecated */
export enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date"
}

export type FilterStoreProvider = DirectProvider | KeyProvider | LegacyProvider;

export type FilterStore = InputFilterInterface | PickerFilterStore;

interface DirectProvider {
    type: "direct";
    store: FilterStore | null;
}

export interface KeyProvider {
    type: "key-value";
    get: (key: string) => FilterStore | null;
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

export function useFilterContextValue(): Result<FilterAPI, APIError> {
    const context = getGlobalFilterContextObject();
    const contextValue = useContext(context);

    if (contextValue == null) {
        return error(ENOCONTEXT);
    }

    return value(contextValue);
}

export function getFilterStore(provider: FilterStoreProvider, legacyType: FilterType, key: string): FilterStore | null {
    switch (provider.type) {
        case "direct":
            return provider.store;
        case "key-value":
            return provider.get(key);
        case "legacy":
            return provider.get(legacyType);
        default:
            return null;
    }
}
