import { Context, createContext, useContext, useMemo } from "react";
import { MultiSelectionService } from "../interfaces/MultiSelectionService.js";
import { SelectionHelperService } from "../interfaces/SelectionHelperService.js";
import { error, Result, value } from "./result-meta.js";

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.selectable.selectionContext" as const;

type SelectionContextObject = Context<MultiSelectionService | undefined>;

declare global {
    interface Window {
        [CONTEXT_OBJECT_PATH]?: SelectionContextObject;
    }
}

export function getGlobalSelectionContext(): SelectionContextObject {
    return (window[CONTEXT_OBJECT_PATH] ??= createContext<MultiSelectionService | undefined>(undefined));
}

export function useCreateSelectionContextValue(
    selection: SelectionHelperService | undefined
): MultiSelectionService | undefined {
    return useMemo(() => (selection?.type === "Multi" ? selection : undefined), [selection]);
}

export function useSelectionContextValue(): Result<MultiSelectionService, OutOfContextError> {
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
