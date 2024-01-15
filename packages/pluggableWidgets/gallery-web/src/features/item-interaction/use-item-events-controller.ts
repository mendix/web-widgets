import { useMemo } from "react";
import { ItemEventsController } from "./ItemEventsController";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";

export function useItemEventsController(
    selectHelper: SelectActionHelper,
    focusController: FocusTargetController
): ItemEventsController {
    return useMemo(
        () =>
            new ItemEventsController(
                item => ({ item, selectionType: selectHelper.selectionType }),
                selectHelper.onSelect,
                selectHelper.onSelectAll,
                focusController.dispatch
            ),
        [selectHelper, focusController]
    );
}
