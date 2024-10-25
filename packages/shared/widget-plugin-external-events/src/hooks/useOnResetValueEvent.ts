import { useRef } from "react";
import { $events } from "../common";
import { useListenChannelEvents } from "./useListenChannelEvents";

type Params = {
    /** Widget name in settings. */
    widgetName: string;
    /** Event listener callback. */
    listener: (...args: any[]) => void;
    /** Event channel name from parent */
    parentChannelName?: string;
};

export function useOnResetValueEvent({ widgetName, parentChannelName, listener }: Params): void {
    const { current: cb } = useRef(listener);
    useListenChannelEvents(widgetName, $events.reset.value, cb);
    useListenChannelEvents(parentChannelName, $events.reset.value, cb);
}
