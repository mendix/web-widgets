import { ElementEntries, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { SelectFx, isSelectOneTrigger, preventScrollOnSpace } from "@mendix/widget-plugin-grid/selection";
import { CellContext } from "./base";

const onClick = (selectFx: SelectFx): EventCaseEntry<CellContext, HTMLDivElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => {
        return ctx.selectionMethod === "rowClick" && (ctx.clickTrigger === "none" || ctx.clickTrigger === "double");
    },
    handler: ({ item }, event) => {
        selectFx(item, event.shiftKey);
    }
});

const onShiftSpace = (selectFx: SelectFx): EventCaseEntry<CellContext, HTMLDivElement, "onKeyUp"> => ({
    eventName: "onKeyUp",
    filter: (ctx, event) => ctx.selectionMethod !== "none" && isSelectOneTrigger(event),
    handler: ({ item }) => selectFx(item, false)
});

export function createSelectHandlers(selectFx: SelectFx): Array<ElementEntries<CellContext, HTMLDivElement>> {
    return [onClick(selectFx), onShiftSpace(selectFx), preventScrollOnSpace()];
}
