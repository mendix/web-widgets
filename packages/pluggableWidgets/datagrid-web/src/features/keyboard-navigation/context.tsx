import { createContext, useMemo, PropsWithChildren, ReactElement, createElement, useContext } from "react";
import { TabAnchorTracker } from "./TabAnchorTracker";
import { useTabAnchorTracker, LayoutProps } from "./useTabAnchorTracker";

export const defaultValue = Symbol("DefaultKeyNavContextValue");

export type ContextValue = {
    tracker: TabAnchorTracker;
};

type Provider = (props: PropsWithChildren) => ReactElement | null;

export const context = createContext<typeof defaultValue | ContextValue>(defaultValue);

export function useKeyNavProvider(props: LayoutProps): Provider {
    const tracker = useTabAnchorTracker(props);

    return useMemo<Provider>(
        () =>
            function Provider({ children }) {
                return <context.Provider value={{ tracker }}>{children}</context.Provider>;
            },
        [tracker]
    );
}

export function useKeyNavContext(): ContextValue {
    const contextValue = useContext(context);

    if (contextValue === defaultValue) {
        throw new Error("useKeyNavContext: context provider is missing");
    }

    return contextValue;
}
