import { EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { CellContext } from "./base";

type ExecuteActionFx = (item: unknown) => void;

const onClick = (execActionFx: ExecuteActionFx): EventCaseEntry<"div", CellContext, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => {
        return ctx.clickTrigger === "single" && (ctx.selectionMethod === "checkbox" || ctx.selectionMethod === "none");
    },
    handler: ({ item }) => execActionFx(item)
});

export function createActionHandlers(execActionFx: ExecuteActionFx): Array<EventCaseEntry<"div", CellContext>> {
    return [onClick(execActionFx)];
}
