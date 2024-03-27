/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { requirePlugin } from "../plugin";

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
