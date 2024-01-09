import { ObjectItem } from "mendix";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { SelectAllFx, SelectFx } from "@mendix/widget-plugin-grid/selection";
import { EventEntryContext } from "./base";
import { createItemHandlers } from "./item-handlers";

export class ItemEventsController implements ItemEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => EventEntryContext,
        private selectFx: SelectFx,
        private selectAllFx: SelectAllFx
    ) {}

    getProps = (item: ObjectItem): ElementProps<HTMLDivElement> => {
        return eventSwitch(() => this.contextFactory(item), [...createItemHandlers(this.selectFx, this.selectAllFx)]);
    };
}
