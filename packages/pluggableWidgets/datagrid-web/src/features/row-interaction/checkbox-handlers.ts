import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { SelectFx } from "@mendix/widget-plugin-grid/selection";
import { CheckboxContext } from "./base";

const onClick = (selectFx: SelectFx): EventCaseEntry<CheckboxContext, HTMLInputElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => ctx.selectionMethod === "checkbox",
    handler: ({ item }, event) => selectFx(item, event.shiftKey)
});

export function checkboxHandlers(selectFx: SelectFx): Array<ElementEntry<CheckboxContext, HTMLInputElement>> {
    return [onClick(selectFx)];
}
