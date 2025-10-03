import { Context, createContext, useContext, useMemo } from "react";
import { SelectionHelper } from "./helpers.js";
import { error, Result, value } from "./result-meta.js";
import { MultiSelectionStatus } from "./types.js";

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.selectable.selectionContext" as const;

interface SelectionStore {
    /** @observable */
    selectionStatus: MultiSelectionStatus;
    togglePageSelection(): void;
}

type SelectionContextObject = Context<SelectionStore | undefined>;

declare global {
    interface Window {
        [CONTEXT_OBJECT_PATH]?: SelectionContextObject;
    }
}

export function getGlobalSelectionContext(): SelectionContextObject {
    return (window[CONTEXT_OBJECT_PATH] ??= createContext<SelectionStore | undefined>(undefined));
}

type UseCreateSelectionContextValueReturn = SelectionStore | undefined;

export function useCreateSelectionContextValue(
    selection: SelectionHelper | undefined
): UseCreateSelectionContextValueReturn {
    return useMemo(() => {
        if (selection?.type === "Multi") {
            return selection;
        }

        return undefined;
    }, [selection]);
}

export function useSelectionContextValue(): Result<SelectionStore, OutOfContextError> {
    const context = getGlobalSelectionContext();
    const contextValue = useContext(context);

    if (contextValue === undefined) {
        return error(new OutOfContextError());
    }

    return value(contextValue);
}

class OutOfContextError extends Error {
    constructor() {
        super("Component is used out of context provider");
    }
}
