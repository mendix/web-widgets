/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback } from "react";
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
    useEffect((): void | (() => void) => {
        if (channelName !== undefined) {
            return requirePlugin().subscribe(channelName, eventName, listener);
        }
    }, [channelName, eventName]);
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
