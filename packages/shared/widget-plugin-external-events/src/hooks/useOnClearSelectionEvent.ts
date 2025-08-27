import { useRef } from "react";
import { $events } from "../common";
import { useListenChannelEvents } from "./useListenChannelEvents";

type Params = {
    /** Widget name in settings. */
    widgetName: string;
    /** Event listener callback. */
    listener: (...args: any[]) => void;
};

export function useOnClearSelectionEvent({ widgetName, listener }: Params): void {
    const { current: cb } = useRef(listener);
    useListenChannelEvents(widgetName, $events.selection.clear, cb);
}
