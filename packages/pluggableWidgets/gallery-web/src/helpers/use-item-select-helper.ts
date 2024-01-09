import { useMemo } from "react";
import { SelectionHelper, WidgetSelectionProperty } from "@mendix/widget-plugin-grid/selection";
import { ItemSelectHelper } from "./ItemSelectHelper";

export function useItemSelectHelper(
    selection: WidgetSelectionProperty,
    selectionHelper: SelectionHelper | undefined
): ItemSelectHelper {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => new ItemSelectHelper(selection, selectionHelper), [selectionHelper]);
}
