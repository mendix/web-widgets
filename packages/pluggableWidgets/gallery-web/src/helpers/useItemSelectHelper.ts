import { useMemo } from "react";
import { SelectionHelper, WidgetSelectionProperty, SelectActionHandler } from "@mendix/widget-plugin-grid/selection";

export function useItemSelectHelper(
    selection: WidgetSelectionProperty,
    selectionHelper: SelectionHelper | undefined
): SelectActionHandler {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => new SelectActionHandler(selection, selectionHelper), [selectionHelper]);
}
