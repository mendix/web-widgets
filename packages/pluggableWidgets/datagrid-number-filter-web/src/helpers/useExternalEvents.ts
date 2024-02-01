import { useListenChannelEvents, recommendedEventNames as events } from "@mendix/widget-plugin-external-events";

type Params = {
    widgetName: string;
    resetValue: () => void;
    datagridChannelName?: string;
};

export function useExternalEvents({ widgetName, resetValue, datagridChannelName }: Params): void {
    useListenChannelEvents(widgetName, events.input.clear, resetValue);
    useListenChannelEvents(datagridChannelName, events.input.clear, resetValue);
}
