import { ElementEntry, ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { ClickEntry, ClickEventSwitch } from "@mendix/widget-plugin-grid/event-switch/ClickEventSwitch";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { ClickActionHelper, ExecuteActionFx } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectActionsService } from "@mendix/widget-plugin-grid/main";
import {
    SelectActionHandler,
    SelectAdjacentFx,
    SelectAllFx,
    SelectFx,
    SelectionMode,
    SelectionType
} from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { createActionHandlers } from "./action-handlers";
import { EventEntryContext } from "./base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { createItemHandlers } from "./item-handlers";

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

    getProps(item: ObjectItem): ElementProps<HTMLDivElement> {
        return eventSwitch(() => this.contextFactory(item), this.getEntries());
    }

    private getEntries(): Array<ElementEntry<EventEntryContext, HTMLDivElement>> {
        const entries = [
            ...createItemHandlers(this.selectFx, this.selectAllFx, this.selectAdjacentFx, this.numberOfColumns),
            ...createActionHandlers(this.executeActionFx),
            ...createFocusTargetHandlers(this.focusTargetFx)
        ];
        const clickEntries = entries.filter(
            (entry): entry is ClickEntry<EventEntryContext, HTMLDivElement> =>
                entry.eventName === "onClick" || entry.eventName === "onDoubleClick"
        );
        const restEntries = entries.filter(
            entry => entry.eventName !== "onClick" && entry.eventName !== "onDoubleClick"
        );
        return [new ClickEventSwitch(clickEntries).getClickEntry(), ...restEntries];
    }
}

export function useItemEventsController(
    selectHelper: SelectActionHandler,
    clickHelper: ClickActionHelper,
    focusController: FocusTargetController,
    numberOfColumns: number,
    selectionMode: SelectionMode
): ItemEventsController {
    return useMemo(
        () =>
            new ItemEventsController(
                item => ({
                    item,
                    selectionType: selectHelper.selectionType,
                    selectionMode,
                    clickTrigger: clickHelper.clickTrigger
                }),
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

export function createItemEventsController(
    config: {
        selectionType: SelectionType;
        selectionMode: SelectionMode;
    },
    selectActions: SelectActionsService,
    clickHelper: ClickActionHelper,
    focusController: FocusTargetController,
    numberOfColumns: number
): ItemEventsController {
    const contextFactory = (item: ObjectItem): EventEntryContext => ({
        item,
        selectionType: config.selectionType,
        selectionMode: config.selectionMode,
        clickTrigger: clickHelper.clickTrigger
    });

    return new ItemEventsController(
        contextFactory,
        selectActions.select,
        selectActions.selectPage,
        clickHelper.onExecuteAction,
        focusController.dispatch,
        selectActions.selectAdjacent,
        numberOfColumns
    );
}
