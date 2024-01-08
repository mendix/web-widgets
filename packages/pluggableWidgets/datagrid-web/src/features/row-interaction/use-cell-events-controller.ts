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

export class CellEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => CellContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx,
        private selectAdjacentFx: SelectAdjacentFx,
        private executeActionFx: ExecuteActionFx
    ) {}

    getProps(item: ObjectItem): ElementProps<HTMLDivElement> {
        const entries = [
            ...createSelectHandlers(this.selectFx, this.selectAllFx, this.selectAdjacentFx),
            ...createActionHandlers(this.executeActionFx)
        ];
        return eventSwitch<CellContext, HTMLDivElement>(() => this.contextFactory(item), entries);
    }
}

export function useCellEventsController(
    selectHelper: SelectActionHelper,
    clickHelper: ClickActionHelper
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
            clickHelper.onExecuteAction
        );
    }, [selectHelper, clickHelper]);
}
