import { EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { SelectFx } from "@mendix/widget-plugin-grid/selection";

const onClick = (selectFx: SelectFx): EventCaseEntry<"div", any, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => {
        return ctx.selectionMethod === "rowClick" && (ctx.clickTrigger === "none" || ctx.clickTrigger === "double");
    },
    handler: ({ item }, event) => {
        selectFx(item, event.shiftKey);
    }
});

export function createSelectHandlers(selectFx: SelectFx): Array<EventCaseEntry<"div", any>> {
    return [onClick(selectFx)];
}
