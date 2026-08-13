import { useOnClearSelectionEvent, useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useGalleryConfig, useSelectActions } from "../model/hooks/injection-hooks";

export function useGalleryJSActions(): void {
    const config = useGalleryConfig();
    const selectActions = useSelectActions();

    useOnResetFiltersEvent(config.name, config.filtersChannelName);
    useOnClearSelectionEvent({
        widgetName: config.name,
        listener: () => selectActions.clearSelection()
    });
}
