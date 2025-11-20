import { useOnClearSelectionEvent, useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { SelectActionsService } from "@mendix/widget-plugin-grid/main";
import { useDatagridConfig } from "../model/hooks/injection-hooks";

export function useDataGridJSActions(selectActions: SelectActionsService): void {
    const info = useDatagridConfig();
    useOnResetFiltersEvent(info.name, info.filtersChannelName);
    useOnClearSelectionEvent({
        widgetName: info.name,
        listener: () => selectActions.clearSelection()
    });
}
