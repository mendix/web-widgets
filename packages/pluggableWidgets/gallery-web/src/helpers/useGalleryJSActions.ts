import { useOnClearSelectionEvent, useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { SelectActionHandler } from "@mendix/widget-plugin-grid/selection";
import { GalleryStore } from "../stores/GalleryStore";

export function useGalleryJSActions(root: GalleryStore, selectActionHelper?: SelectActionHandler): void {
    useOnResetFiltersEvent(root.name, root.id);
    useOnClearSelectionEvent({
        widgetName: root.name,
        listener: () => selectActionHelper?.onClearSelection()
    });
}
