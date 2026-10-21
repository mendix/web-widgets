import { Context, createContext, useContext } from "react";

/** Tells child filter widgets whether the parent widget uses Dynamic filters. */
export interface DynamicModeContextValue {
    dynamic: boolean;
}

type DynamicModeContext = Context<DynamicModeContextValue | null>;

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.filterable.dynamicModeContext.v1" as const;

declare global {
    interface Window {
        [CONTEXT_OBJECT_PATH]: DynamicModeContext | undefined;
    }
}

/** Shared through `window` so separately bundled widgets get the same context object. */
export function getGlobalDynamicModeContext(): DynamicModeContext {
    return (window[CONTEXT_OBJECT_PATH] ??= createContext<DynamicModeContextValue | null>(null));
}

/** True only when a parent explicitly provides Dynamic mode. */
export function useDynamicMode(): boolean {
    return useContext(getGlobalDynamicModeContext())?.dynamic ?? false;
}
