import { useEffect, useCallback } from "react";
import { PluginExternalEvents, requirePlugin } from "./plugin";

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
            const events = requirePlugin();
            return events.subscribe(channelName, eventName, listener);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelName, eventName]);
}
