import { useMemo } from "react";
import { ItemEventsController } from "./ItemEventsController";
import { ClickActionHelper } from "../../helpers/ClickActionHelper";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";

export function useItemEventsController(
    selectHelper: SelectActionHelper,
    clickHelper: ClickActionHelper,
    focusController: FocusTargetController
): ItemEventsController {
    return useMemo(
        () =>
            new ItemEventsController(
                item => ({ item, selectionType: selectHelper.selectionType }),
                selectHelper.onSelect,
                selectHelper.onSelectAll,
                clickHelper.onExecuteAction,
                focusController.dispatch
            ),
        [selectHelper, focusController]
    );
}
