import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { createActionHandlers } from "./action-handlers";
import { CellContext } from "./base";
import { createSelectHandlers } from "./select-handlers";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";
import { SelectAdjacentFx, SelectAllFx, SelectFx } from "@mendix/widget-plugin-grid/selection";
import { ClickActionHelper, ExecuteActionFx } from "../../helpers/ClickActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import { createFocusTargetHandlers } from "./focus-target-handlers";

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
        const entries = [
            ...createSelectHandlers(this.selectFx, this.selectAllFx, this.selectAdjacentFx),
            ...createActionHandlers(this.executeActionFx),
            ...createFocusTargetHandlers(this.focusTargetFx)
        ];
        return eventSwitch<CellContext, HTMLDivElement>(() => this.contextFactory(item), entries);
    }
}

export function useCellEventsController(
    selectHelper: SelectActionHelper,
    clickHelper: ClickActionHelper,
    focusController: FocusTargetController
): CellEventsController {
    return useMemo(() => {
        const cellContextFactory = (item: ObjectItem): CellContext => ({
            item,
            pageSize: selectHelper.pageSize,
            selectionType: selectHelper.selectionType,
            selectionMethod: selectHelper.selectionMethod,
            clickTrigger: clickHelper.clickTrigger
        });

        return new CellEventsController(
            cellContextFactory,
            selectHelper.onSelect,
            selectHelper.onSelectAll,
            selectHelper.onSelectAdjacent,
            clickHelper.onExecuteAction,
            focusController.dispatch
        );
    }, [selectHelper, clickHelper, focusController]);
}
