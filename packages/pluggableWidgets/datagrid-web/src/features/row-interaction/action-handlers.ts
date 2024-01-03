import { ElementEntries, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { CellContext } from "./base";

type ExecuteActionFx = (item: unknown) => void;

const onClick = (execActionFx: ExecuteActionFx): EventCaseEntry<CellContext, HTMLDivElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => {
        return ctx.clickTrigger === "single" && (ctx.selectionMethod === "checkbox" || ctx.selectionMethod === "none");
    },
    handler: ({ item }) => execActionFx(item)
});

export function createActionHandlers(
    execActionFx: ExecuteActionFx
): Array<ElementEntries<CellContext, HTMLDivElement>> {
    return [onClick(execActionFx)];
}
