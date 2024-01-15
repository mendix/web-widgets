import { ObjectItem } from "mendix";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import { SelectAllFx, SelectFx } from "@mendix/widget-plugin-grid/selection";
import { EventEntryContext } from "./base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { createItemHandlers } from "./item-handlers";

export class ItemEventsController implements ItemEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => EventEntryContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx,
        private focusTargetFx: FocusTargetFx
    ) {}

    getProps = (item: ObjectItem): ElementProps<HTMLDivElement> => {
        const entries = [
            ...createItemHandlers(this.selectFx, this.selectAllFx),
            ...createFocusTargetHandlers(this.focusTargetFx)
        ];
        return eventSwitch(() => this.contextFactory(item), entries);
    };
}
