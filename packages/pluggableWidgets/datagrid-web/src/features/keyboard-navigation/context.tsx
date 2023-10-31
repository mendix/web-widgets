import { createContext, useMemo, PropsWithChildren, ReactElement, createElement, useContext } from "react";
import { FocusTargetController } from "./FocusTargetController";
import { useFocusTargetController, LayoutProps } from "./useFocusTargetController";

export const defaultValue = Symbol("DefaultKeyNavContextValue");

export type ContextValue = {
    focusController: FocusTargetController;
};

type Provider = (props: PropsWithChildren) => ReactElement | null;

export const context = createContext<typeof defaultValue | ContextValue>(defaultValue);

export function useKeyNavProvider(props: LayoutProps): Provider {
    const focusController = useFocusTargetController(props);

    return useMemo<Provider>(
        () =>
            function Provider({ children }) {
                return <context.Provider value={{ focusController }}>{children}</context.Provider>;
            },
        [focusController]
    );
}

export function useKeyNavContext(): ContextValue {
    const contextValue = useContext(context);

    if (contextValue === defaultValue) {
        throw new Error("useKeyNavContext: context provider is missing");
    }

    return contextValue;
}
