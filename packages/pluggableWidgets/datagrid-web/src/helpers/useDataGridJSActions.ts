import { useOnClearSelectionEvent, useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useDatagridConfig, useSelectActions } from "../model/hooks/injection-hooks";

export function useDataGridJSActions(): void {
    const info = useDatagridConfig();
    const selectActions = useSelectActions();
    useOnResetFiltersEvent(info.name, info.filtersChannelName);
    useOnClearSelectionEvent({
        widgetName: info.name,
        listener: () => selectActions.clearSelection()
    });
}
