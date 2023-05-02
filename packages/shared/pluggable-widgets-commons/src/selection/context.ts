import { createContext, useContext, Context, useCallback, useMemo } from "react";
import { error, value, ValueMeta } from "../utils/valueStatus";
import { OutOfContextError } from "../components/web/utils/errors";
import { SelectionHelper } from "./";

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

export function useCreateSelectionContextValue(selection: SelectionHelper | undefined) {
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

export function useSelectionContextValue(): ValueMeta<SelectionContextValue, OutOfContextError> {
    const context = getGlobalSelectionContext();
    const contextValue = useContext(context);

    if (contextValue === undefined) {
        return error(new OutOfContextError());
    }

    return value(contextValue);
}
