import { useOnClearSelectionEvent, useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useDatagridConfig } from "../deps-hooks";
import { SelectActionHelper } from "./SelectActionHelper";

export function useDataGridJSActions(selectActionHelper?: SelectActionHelper): void {
    const info = useDatagridConfig();
    useOnResetFiltersEvent(info.name, info.filtersChannelName);
    useOnClearSelectionEvent({
        widgetName: info.name,
        listener: () => selectActionHelper?.onClearSelection()
    });
}
