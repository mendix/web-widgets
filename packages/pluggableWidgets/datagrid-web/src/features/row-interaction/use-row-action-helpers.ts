import { SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { useEffect, useMemo } from "react";
import { DatagridContainerProps, DatagridPreviewProps } from "../../../typings/DatagridProps";
import { ClickActionHelper } from "../../helpers/ClickActionHelper";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";
import { CellEventsController, useCellEventsController } from "./use-cell-events-controller";
import { CheckboxEventsController, useCheckboxEventsController } from "./use-checkbox-events-controller";

export function useRowActionHelpers(
    props: DatagridContainerProps | DatagridPreviewProps,
    selectionHelper?: SelectionHelper
): [SelectActionHelper, CellEventsController, CheckboxEventsController] {
    const selectActionHelper = useMemo(
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const clickActionHelper = useMemo(() => new ClickActionHelper(props.onClickTrigger, props.onClick), []);

    useEffect(() => {
        clickActionHelper.update(props.onClick);
    });

    const cellEventsController = useCellEventsController(selectActionHelper, clickActionHelper);

    const checkboxEventsController = useCheckboxEventsController(selectActionHelper);

    return [selectActionHelper, cellEventsController, checkboxEventsController];
}
