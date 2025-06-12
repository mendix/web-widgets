import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { FilterCondition } from "mendix/filters";
import { Context, createContext, useContext } from "react";
import { APIError, ENOCONTEXT } from "./errors";
import { Result, error, value } from "./result-meta";
import { InputFilterInterface } from "./typings/InputFilterInterface";
import { ObservableFilterHost } from "./typings/ObservableFilterHost";

export interface FilterAPI {
    version: 3;
    parentChannelName: string;
    provider: Result<DirectProvider | ProviderStub, APIError>;
    filterObserver: ObservableFilterHost;
    sharedInitFilter: Array<FilterCondition | undefined>;
}

export type FilterStore = InputFilterInterface | EnumFilterStore;

interface DirectProvider {
    type: "direct";
    store: FilterStore | null;
}

interface ProviderStub {
    type: "stub";
    hint: "No filter store available";
}

export const PROVIDER_STUB = Object.freeze({ type: "stub", hint: "No filter store available" } as const);

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

export function createContextWithStub(options: {
    filterObserver: ObservableFilterHost;
    parentChannelName: string;
    sharedInitFilter: Array<FilterCondition | undefined>;
}): FilterAPI {
    return {
        version: 3,
        parentChannelName: options.parentChannelName,
        provider: value(PROVIDER_STUB),
        filterObserver: options.filterObserver,
        sharedInitFilter: options.sharedInitFilter
    };
}
