import { ElementEntry, ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { ClickEntry, ClickEventSwitch } from "@mendix/widget-plugin-grid/event-switch/ClickEventSwitch";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { ClickActionHelper, ExecuteActionFx } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
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
import { computed } from "mobx";
import { createActionHandlers } from "./action-handlers";
import { EventEntryContext } from "./base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { createItemHandlers } from "./item-handlers";

export class ItemEventsViewModel {
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

export function createItemEventsVMAtom(
    config: {
        selectionType: SelectionType;
        selectionMode: SelectionMode;
    },
    selectActions: SelectActionsService,
    clickHelper: ClickActionHelper,
    focusController: FocusTargetController,
    numberOfColumns: ComputedAtom<number>
): ComputedAtom<ItemEventsViewModel> {
    const contextFactory = (item: ObjectItem): EventEntryContext => ({
        item,
        selectionType: config.selectionType,
        selectionMode: config.selectionMode,
        clickTrigger: clickHelper.clickTrigger
    });

    return computed(
        () =>
            new ItemEventsViewModel(
                contextFactory,
                selectActions.select,
                selectActions.selectPage,
                clickHelper.onExecuteAction,
                focusController.dispatch,
                selectActions.selectAdjacent,
                numberOfColumns.get()
            )
    );
}
