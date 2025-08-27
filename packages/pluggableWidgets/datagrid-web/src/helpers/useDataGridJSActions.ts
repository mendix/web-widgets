import { useOnClearSelectionEvent, useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { SelectActionHelper } from "./SelectActionHelper";
import { RootGridStore } from "./state/RootGridStore";

export function useDataGridJSActions(root: RootGridStore, selectActionHelper?: SelectActionHelper): void {
    useOnResetFiltersEvent(root.staticInfo.name, root.staticInfo.filtersChannelName);
    useOnClearSelectionEvent({
        widgetName: root.staticInfo.name,
        listener: () => selectActionHelper?.onClearSelection()
    });
}
