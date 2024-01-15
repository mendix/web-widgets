import { useMemo } from "react";
import { SelectionHelper, WidgetSelectionProperty } from "@mendix/widget-plugin-grid/selection";
import { SelectActionHelper } from "./SelectActionHelper";

export function useItemSelectHelper(
    selection: WidgetSelectionProperty,
    selectionHelper: SelectionHelper | undefined
): SelectActionHelper {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => new SelectActionHelper(selection, selectionHelper), [selectionHelper]);
}
