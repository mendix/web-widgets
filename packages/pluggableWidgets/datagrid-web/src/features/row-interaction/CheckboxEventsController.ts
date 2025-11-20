import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectActionsService } from "@mendix/widget-plugin-grid/main";
import {
    SelectAdjacentFx,
    SelectAllFx,
    SelectFx,
    SelectionMode,
    SelectionType
} from "@mendix/widget-plugin-grid/selection";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { ObjectItem } from "mendix";
import { CheckboxContext, SelectionMethod } from "./base";
import { checkboxHandlers } from "./checkbox-handlers";
import { createFocusTargetHandlers } from "./focus-target-handlers";

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

export function creteCheckboxEventsController(
    config: {
        selectionType: SelectionType;
        selectionMethod: SelectionMethod;
        selectionMode: SelectionMode;
    },
    selectActions: SelectActionsService,
    focusController: FocusTargetController,
    pageSize: ComputedAtom<number>
): CheckboxEventsController {
    const contextFactory = (item: ObjectItem): CheckboxContext => ({
        type: "checkbox",
        item,
        pageSize: pageSize.get(),
        selectionType: config.selectionType,
        selectionMethod: config.selectionMethod,
        selectionMode: config.selectionMode
    });
    return new CheckboxEventsController(
        contextFactory,
        selectActions.select,
        selectActions.selectPage,
        selectActions.selectAdjacent,
        focusController.dispatch
    );
}
