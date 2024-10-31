import { SelectionStatus } from "@mendix/widget-plugin-grid/selection";
import { useHelpersContext } from "./helpers-context";

export function useSelectionStatus(): SelectionStatus {
    const { selectionHelper, preview } = useHelpersContext();
    let selectionStatus: SelectionStatus = "unknown";
    if (preview) {
        selectionStatus = "none";
    } else if (selectionHelper?.type === "Multi") {
        selectionStatus = selectionHelper.selectionStatus;
    }
    return selectionStatus;
}
