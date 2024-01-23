import { ObjectItem } from "mendix";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";
import { SelectAllFx, SelectFx } from "@mendix/widget-plugin-grid/selection";
import { EventEntryContext } from "./base";
import { createFocusTargetHandlers } from "./focus-target-handlers";
import { createItemHandlers } from "./item-handlers";
import { createActionHandlers } from "./action-handlers";
import { ExecuteActionFx } from "../../helpers/ClickActionHelper";

export class ItemEventsController implements ItemEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => EventEntryContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx,
        private executeActionFx: ExecuteActionFx,
        private focusTargetFx: FocusTargetFx
    ) {}

    getProps = (item: ObjectItem): ElementProps<HTMLDivElement> => {
        const entries = [
            ...createItemHandlers(this.selectFx, this.selectAllFx),
            ...createFocusTargetHandlers(this.focusTargetFx),
            ...createActionHandlers(this.executeActionFx)
        ];
        return eventSwitch(() => this.contextFactory(item), entries);
    };
}
