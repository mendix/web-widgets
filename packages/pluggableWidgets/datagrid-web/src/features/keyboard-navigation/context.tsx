import { createContext, useMemo, PropsWithChildren, ReactElement, createElement, useContext } from "react";
import { FocusTargetController } from "./FocusTargetController";
import { useFocusTargetController, LayoutProps } from "./useFocusTargetController";

export const defaultValue = Symbol("DefaultKeyNavContextValue");

export type ContextValue = {
    focusController: FocusTargetController;
};

export const context = createContext<typeof defaultValue | ContextValue>(defaultValue);

export function KeyNavProvider(props: PropsWithChildren<LayoutProps>): ReactElement | null {
    const focusController = useFocusTargetController(props);
    const value: ContextValue = useMemo(() => ({ focusController }), [focusController]);

    return <context.Provider value={value}>{props.children}</context.Provider>;
}

export function useKeyNavContext(): ContextValue {
    const contextValue = useContext(context);

    if (contextValue === defaultValue) {
        throw new Error("useKeyNavContext: context provider is missing");
    }

    return contextValue;
}
