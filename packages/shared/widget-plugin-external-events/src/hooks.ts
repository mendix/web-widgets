import { useEffect, useCallback, useMemo } from "react";
import { PluginExternalEvents, requirePlugin } from "./plugin";
import { $events } from "./common";

type Emit = PluginExternalEvents["emit"];

export function useChannelEmit(): Emit {
    return useCallback((...args: Parameters<Emit>) => {
        requirePlugin().emit(...args);
    }, []);
}

export function useListenChannelEvents(
    channelName: string | undefined,
    eventName: string,
    listener: (...args: any[]) => any
): void {
    const JEST_BUG_KEY = useMemo(() => Math.random(), []);

    useEffect((): void | (() => void) => {
        if (channelName !== undefined) {
            return requirePlugin().subscribe(channelName, eventName, listener);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelName, eventName, JEST_BUG_KEY]);
}

type Params = {
    /** Widget name in settings. */
    widgetName: string;
    /** Event listener callback. */
    listener: () => void;
    /** Event channel name from parent */
    parentChannelName?: string;
};

export function useFilterResetEvent({ widgetName, parentChannelName, listener }: Params): void {
    useListenChannelEvents(widgetName, $events.reset.value, listener);
    useListenChannelEvents(parentChannelName, $events.reset.value, listener);
}
