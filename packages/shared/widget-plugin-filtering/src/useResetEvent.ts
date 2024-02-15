import { useListenChannelEvents, recommendedEventNames as events } from "@mendix/widget-plugin-external-events";

type Params = {
    /** Widget name in settings. */
    widgetName: string;
    /** Event listener callback. */
    listener: () => void;
    /** Event channel name from parent data grid. */
    datagridChannelName?: string;
};

export function useResetEvent({ widgetName, listener, datagridChannelName }: Params): void {
    useListenChannelEvents(widgetName, events.input.clear, listener);
    useListenChannelEvents(datagridChannelName, events.input.clear, listener);
}
