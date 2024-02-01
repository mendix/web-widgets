import { useMemo } from "react";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import {
    useListenChannelEvents,
    useChannelEmit,
    recommendedEventNames as events
} from "@mendix/widget-plugin-external-events";

type FilterChannelName = string;

export function useExternalEvents(gridName: string): FilterChannelName {
    const emit = useChannelEmit();
    const filterChannelName = useMemo(() => `datagrid/${generateUUID()}`, []);

    useListenChannelEvents(gridName, events.grid.resetFilters, () => {
        emit(filterChannelName, events.input.clear);
    });

    return filterChannelName;
}
