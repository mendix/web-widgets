import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import { SelectAdjacentFx, SelectAllFx, SelectFx, SelectActionHandler } from "@mendix/widget-plugin-grid/selection";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { EventEntryContext } from "./base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { createItemHandlers } from "./item-handlers";
import { createActionHandlers } from "./action-handlers";
import { ClickActionHelper, ExecuteActionFx } from "../../helpers/ClickActionHelper";

export class ItemEventsController implements ItemEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => EventEntryContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx,
        private executeActionFx: ExecuteActionFx,
        private focusTargetFx: FocusTargetFx,
        private selectAdjacentFx: SelectAdjacentFx,
        private numberOfColumns: number
    ) {}

    getProps = (item: ObjectItem): ElementProps<HTMLDivElement> => {
        const entries = [
            ...createItemHandlers(this.selectFx, this.selectAllFx, this.selectAdjacentFx, this.numberOfColumns),
            ...createFocusTargetHandlers(this.focusTargetFx),
            ...createActionHandlers(this.executeActionFx)
        ];
        return eventSwitch(() => this.contextFactory(item), entries);
    };
}

export function useItemEventsController(
    selectHelper: SelectActionHandler,
    clickHelper: ClickActionHelper,
    focusController: FocusTargetController,
    numberOfColumns: number
): ItemEventsController {
    return useMemo(
        () =>
            new ItemEventsController(
                item => ({ item, selectionType: selectHelper.selectionType, selectionMode: "clear" }),
                selectHelper.onSelect,
                selectHelper.onSelectAll,
                clickHelper.onExecuteAction,
                focusController.dispatch,
                selectHelper.onSelectAdjacent,
                numberOfColumns
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectHelper, focusController, numberOfColumns]
    );
}
