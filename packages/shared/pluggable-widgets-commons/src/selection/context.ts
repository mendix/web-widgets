import { error, value, ValueMeta } from "../utils/valueStatus";
import { OutOfContextError } from "../components/web/utils/errors";
import { createContext, useContext, Context } from "react";

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

export function useSelectionContextValue(): ValueMeta<SelectionContextValue, OutOfContextError> {
    const context = getGlobalSelectionContext();
    const contextValue = useContext(context);

    if (contextValue === undefined) {
        return error(new OutOfContextError());
    }

    return value(contextValue);
}
