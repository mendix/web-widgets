import { Result, error, value } from "./result-meta.js";
import { Context, createContext, useContext } from "react";
import { FilterType } from "./provider.js";
import { InputFilterInterface } from "./typings/InputFilterInterface.js";
import { OptionListFilterInterface } from "./typings/OptionListFilterInterface.js";
import { OutOfContextError } from "./errors.js";

export interface FilterAPIv2 {
    version: 2;
    parentChannelName: string;
    provider: StoreProvider;
}

export type StoreProvider = DirectProvider | KeyProvider | LegacyProvider;

interface DirectProvider {
    type: "direct";
    store: InputFilterInterface | OptionListFilterInterface<string> | null;
}

interface KeyProvider {
    type: "key-value";
    get: (key: string) => InputFilterInterface | OptionListFilterInterface<string>;
}

export interface LegacyProvider {
    type: "legacy";
    get: (type: FilterType) => InputFilterInterface | OptionListFilterInterface<string> | null;
}

type Context_v2 = Context<FilterAPIv2 | undefined>;

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.filterable.filterContext2" as const;

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
