import { SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { useMemo } from "react";
import { DatagridContainerProps, DatagridPreviewProps } from "../../typings/DatagridProps";
import { SelectActionHelper } from "./SelectActionHelper";

export function useSelectActionHelper(
    props: Pick<
        DatagridContainerProps | DatagridPreviewProps,
        "itemSelection" | "itemSelectionMethod" | "showSelectAllToggle" | "pageSize"
    >,
    selectionHelper?: SelectionHelper
): SelectActionHelper {
    return useMemo(
        () =>
            new SelectActionHelper(
                props.itemSelection,
                selectionHelper,
                props.itemSelectionMethod,
                props.showSelectAllToggle,
                props.pageSize ?? 5
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectionHelper]
    );
}
