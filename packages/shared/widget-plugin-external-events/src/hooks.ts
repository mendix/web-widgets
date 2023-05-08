import { useEffect, useState } from "react";
import { PluginExternalEvents, requirePlugin } from "./plugin";

type Emit = PluginExternalEvents["emit"];

export function useChannelEmit(): Emit {
    const [emit] = useState(() => {
        const events = requirePlugin();
        return (...args: Parameters<Emit>) => events.emit(...args);
    });
    return emit;
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
