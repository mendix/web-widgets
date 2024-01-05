import { ElementEntries, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { CheckboxContext } from "./base";
import { SelectFx } from "@mendix/widget-plugin-grid/selection";

const onClick = (selectFx: SelectFx): EventCaseEntry<CheckboxContext, HTMLInputElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => ctx.selectionMethod === "checkbox",
    handler: ({ item }, event) => selectFx(item, event.shiftKey)
});

export function checkboxHandlers(selectFx: SelectFx): Array<ElementEntries<CheckboxContext, HTMLInputElement>> {
    return [onClick(selectFx)];
}
