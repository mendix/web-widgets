import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { SelectAdjacentFx, SelectAllFx, SelectFx } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";
import { CheckboxContext } from "./base";
import { checkboxHandlers } from "./checkbox-handlers";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";

export class CheckboxEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => CheckboxContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx,
        private selectAdjacentFx: SelectAdjacentFx,
        private focusTargetFx: FocusTargetFx
    ) {}

    getProps = (item: ObjectItem): ElementProps<HTMLInputElement> =>
        eventSwitch<CheckboxContext, HTMLInputElement>(
            () => this.contextFactory(item),
            [
                ...checkboxHandlers(this.selectFx, this.selectAllFx, this.selectAdjacentFx),
                ...createFocusTargetHandlers(this.focusTargetFx)
            ]
        );
}

export function useCheckboxEventsController(
    selectHelper: SelectActionHelper,
    focusController: FocusTargetController
): CheckboxEventsController {
    return useMemo(() => {
        const contextFactory = (item: ObjectItem): CheckboxContext => ({
            item,
            pageSize: selectHelper.pageSize,
            selectionType: selectHelper.selectionType,
            selectionMethod: selectHelper.selectionMethod,
            selectionMode: selectHelper.selectionMode
        });
        return new CheckboxEventsController(
            contextFactory,
            selectHelper.onSelect,
            selectHelper.onSelectAll,
            selectHelper.onSelectAdjacent,
            focusController.dispatch
        );
    }, [selectHelper, focusController]);
}
