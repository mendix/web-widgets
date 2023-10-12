import { createContext, useContext, Context, useCallback, useMemo } from "react";
import { error, value, Result } from "./result-meta.js";
import { SelectionHelper } from "./helpers.js";
import { MultiSelectionStatus } from "./types.js";

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.selectable.selectionContext" as const;

type SelectionContextValue = { status: "all" | "some" | "none"; toggle: () => void };
type SelectionContextObject = Context<SelectionContextValue | undefined>;
declare global {
    interface Window {
        [CONTEXT_OBJECT_PATH]?: SelectionContextObject;
    }
}

export function getGlobalSelectionContext(): SelectionContextObject {
    if (window[CONTEXT_OBJECT_PATH] === undefined) {
        window[CONTEXT_OBJECT_PATH] = createContext<SelectionContextValue | undefined>(undefined);
    }

    return window[CONTEXT_OBJECT_PATH]!;
}

type UseCreateSelectionContextValueReturn =
    | {
          status: MultiSelectionStatus;
          toggle: () => void;
      }
    | undefined;

export function useCreateSelectionContextValue(
    selection: SelectionHelper | undefined
): UseCreateSelectionContextValueReturn {
    const toggleSelection = useCallback(() => {
        if (selection?.type === "Multi") {
            if (selection.selectionStatus === "all") {
                selection.selectNone();
            } else {
                selection.selectAll();
            }
        }
    }, [selection]);
    const multiSelectionStatus = selection?.type === "Multi" ? selection.selectionStatus : undefined;

    return useMemo(() => {
        if (multiSelectionStatus !== undefined) {
            return {
                status: multiSelectionStatus,
                toggle: toggleSelection
            };
        }

        return undefined;
    }, [multiSelectionStatus, toggleSelection]);
}

export function useSelectionContextValue(): Result<SelectionContextValue, OutOfContextError> {
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
