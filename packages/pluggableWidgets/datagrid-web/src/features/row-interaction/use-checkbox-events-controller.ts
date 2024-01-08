import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { SelectAllFx, SelectFx } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";
import { CheckboxContext } from "./base";
import { checkboxHandlers } from "./checkbox-handlers";
import { FocusTargetFx } from "../keyboard-navigation/base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { FocusTargetController } from "../keyboard-navigation/FocusTargetController";

export class CheckboxEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => CheckboxContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx,
        private focusTargetFx: FocusTargetFx
    ) {}

    getProps = (item: ObjectItem): ElementProps<HTMLInputElement> =>
        eventSwitch<CheckboxContext, HTMLInputElement>(
            () => this.contextFactory(item),
            [...checkboxHandlers(this.selectFx, this.selectAllFx), ...createFocusTargetHandlers(this.focusTargetFx)]
        );
}

export function useCheckboxEventsController(
    selectHelper: SelectActionHelper,
    focusController: FocusTargetController
): CheckboxEventsController {
    return useMemo(() => {
        const contextFactory = (item: ObjectItem): CheckboxContext => ({
            item,
            selectionType: selectHelper.selectionType,
            selectionMethod: selectHelper.selectionMethod
        });
        return new CheckboxEventsController(
            contextFactory,
            selectHelper.onSelect,
            selectHelper.onSelectAll,
            focusController.dispatch
        );
    }, [selectHelper, focusController]);
}
