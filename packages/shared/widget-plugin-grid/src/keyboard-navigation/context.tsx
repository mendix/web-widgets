import { createContext, createElement, PropsWithChildren, ReactElement, useContext, useMemo } from "react";
import { FocusTargetController } from "./FocusTargetController";

export const defaultValue = Symbol("DefaultKeyNavContextValue");

export type ContextValue = {
    focusController: FocusTargetController;
};

export const context = createContext<typeof defaultValue | ContextValue>(defaultValue);

export function KeyNavProvider({
    focusController,
    children
}: PropsWithChildren<{ focusController: FocusTargetController }>): ReactElement | null {
    const value: ContextValue = useMemo(() => ({ focusController }), [focusController]);

    return <context.Provider value={value}>{children}</context.Provider>;
}

export function useKeyNavContext(): ContextValue {
    const contextValue = useContext(context);

    if (contextValue === defaultValue) {
        throw new Error("useKeyNavContext: context provider is missing");
    }

    return contextValue;
}
