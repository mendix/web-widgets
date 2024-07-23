import { Result, error, value } from "./result-meta.js";
import { Context, createContext, useContext } from "react";
import { InputFilterInterface } from "./typings/InputFilterInterface.js";
import { OptionListFilterInterface } from "./typings/OptionListFilterInterface.js";
import { OutOfContextError } from "./errors.js";

export interface FilterAPIv2 {
    version: 2;
    parentChannelName: string;
    provider: Result<FilterStoreProvider, Error>;
}

/** @deprecated */
export enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date"
}

export type FilterStoreProvider = DirectProvider | KeyProvider | LegacyProvider;

export type FilterStore = InputFilterInterface | OptionListFilterInterface<string> | null;

interface DirectProvider {
    type: "direct";
    store: FilterStore;
}

export interface KeyProvider {
    type: "key-value";
    get: (key: string) => NonNullable<FilterStore>;
}

/** @deprecated */
export interface LegacyProvider {
    type: "legacy";
    get: (type: FilterType) => FilterStore;
}

type Context_v2 = Context<FilterAPIv2 | undefined>;

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.filterable.filterContext.v2" as const;

declare global {
    interface Window {
        [CONTEXT_OBJECT_PATH]: Context_v2 | undefined;
    }
}
export function getGlobalFilterContextObject(): Context_v2 {
    return (window[CONTEXT_OBJECT_PATH] ??= createContext<FilterAPIv2 | undefined>(undefined));
}

export function useFilterContextValue(): Result<FilterAPIv2, OutOfContextError> {
    const context = getGlobalFilterContextObject();
    const contextValue = useContext(context);

    if (contextValue == null) {
        return error(new OutOfContextError());
    }

    return value(contextValue);
}

export function getFilterStore(provider: FilterStoreProvider, legacyType: FilterType, key: string): FilterStore {
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
