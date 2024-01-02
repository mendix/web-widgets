import { EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { SelectFx } from "@mendix/widget-plugin-grid/selection";
import { CellContext } from "./base";

const onClick = (selectFx: SelectFx): EventCaseEntry<"div", CellContext, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => {
        return ctx.selectionMethod === "rowClick" && (ctx.clickTrigger === "none" || ctx.clickTrigger === "double");
    },
    handler: ({ item }, event) => {
        selectFx(item, event.shiftKey);
    }
});

export function createSelectHandlers(selectFx: SelectFx): Array<EventCaseEntry<"div", CellContext>> {
    return [onClick(selectFx)];
}
