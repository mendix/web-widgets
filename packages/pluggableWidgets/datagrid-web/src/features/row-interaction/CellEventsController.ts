import { ClickEntry, ClickEventSwitch } from "@mendix/widget-plugin-grid/event-switch/ClickEventSwitch";
import { ElementEntry, ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { ClickActionHelper, ExecuteActionFx } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import {
    SelectAdjacentFx,
    SelectAllFx,
    SelectFx,
    SelectionMode,
    SelectionType
} from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";

import { SelectActionsService } from "@mendix/widget-plugin-grid/main";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { createActionHandlers } from "./action-handlers";
import { CellContext, SelectionMethod } from "./base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { createSelectHandlers } from "./select-handlers";

export class CellEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => CellContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx,
        private selectAdjacentFx: SelectAdjacentFx,
        private executeActionFx: ExecuteActionFx,
        private focusTargetFx: FocusTargetFx
    ) {}

    getProps(item: ObjectItem): ElementProps<HTMLDivElement> {
        return eventSwitch(() => this.contextFactory(item), this.getEntries());
    }

    private getEntries(): Array<ElementEntry<CellContext, HTMLDivElement>> {
        const entries = [
            ...createSelectHandlers(this.selectFx, this.selectAllFx, this.selectAdjacentFx),
            ...createActionHandlers(this.executeActionFx),
            ...createFocusTargetHandlers(this.focusTargetFx)
        ];
        const clickEntries = entries.filter(
            (entry): entry is ClickEntry<CellContext, HTMLDivElement> =>
                entry.eventName === "onClick" || entry.eventName === "onDoubleClick"
        );
        const restEntries = entries.filter(
            entry => entry.eventName !== "onClick" && entry.eventName !== "onDoubleClick"
        );
        return [new ClickEventSwitch(clickEntries).getClickEntry(), ...restEntries];
    }
}

export function createCellEventsController(
    config: {
        selectionType: SelectionType;
        selectionMethod: SelectionMethod;
        selectionMode: SelectionMode;
    },
    selectActions: SelectActionsService,
    focusController: FocusTargetController,
    clickHelper: ClickActionHelper,
    pageSize: ComputedAtom<number>
): CellEventsController {
    // Placeholder function, actual implementation will depend on the specific context and services available.
    const cellContextFactory = (item: ObjectItem): CellContext => ({
        type: "cell",
        item,
        pageSize: pageSize.get(),
        selectionType: config.selectionType,
        selectionMethod: config.selectionMethod,
        selectionMode: config.selectionMode,
        clickTrigger: clickHelper.clickTrigger
    });

    return new CellEventsController(
        cellContextFactory,
        selectActions.select,
        selectActions.selectPage,
        selectActions.selectAdjacent,
        clickHelper.onExecuteAction,
        focusController.dispatch
    );
}
