import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { ExecuteActionFx } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { CellContext } from "./base";
import { onOwnSpaceKeyDown } from "@mendix/widget-plugin-grid/selection";

const onClick = (execActionFx: ExecuteActionFx): EventCaseEntry<CellContext, HTMLDivElement, "onClick"> => ({
    eventName: "onClick",
    filter: (ctx, event) => {
        if (ctx.clickTrigger === "single" && ctx.selectionMethod === "none") {
            return true;
        }
        return ctx.clickTrigger === "single" && ctx.selectionMethod === "checkbox" && !event.metaKey && !event.ctrlKey;
    },
    handler: ({ item }) => execActionFx(item)
});

const onDoubleClick = (
    execActionFx: ExecuteActionFx
): EventCaseEntry<CellContext, HTMLDivElement, "onDoubleClick"> => ({
    eventName: "onDoubleClick",
    filter: (ctx, event) => {
        if (ctx.selectionMethod === "none") {
            return ctx.clickTrigger === "double";
        }

        return ctx.clickTrigger === "double" && !event.metaKey && !event.ctrlKey;
    },
    handler: ({ item }) => execActionFx(item)
});

const canExecOnSpaceOrEnter = (ctx: CellContext, event: React.KeyboardEvent): boolean => {
    if (event.code === "Space" && ctx.clickTrigger !== "none") {
        return event.shiftKey ? ctx.selectionMethod === "none" : true;
    }

    return event.code === "Enter" && ctx.clickTrigger !== "none";
};

const onSpaceOrEnter = (
    execActionFx: ExecuteActionFx
): [
    EventCaseEntry<CellContext, HTMLDivElement, "onKeyDown">,
    EventCaseEntry<CellContext, HTMLDivElement, "onKeyUp">
] => {
    let pressed = false;
    return [
        {
            eventName: "onKeyDown",
            filter: canExecOnSpaceOrEnter,
            handler: () => (pressed = true)
        },
        {
            eventName: "onKeyUp",
            filter: (ctx, event) => canExecOnSpaceOrEnter(ctx, event) && pressed,
            handler: ({ item }) => {
                pressed = false;
                execActionFx(item);
            }
        }
    ];
};

export function createActionHandlers(execActionFx: ExecuteActionFx): Array<ElementEntry<CellContext, HTMLDivElement>> {
    return [
        onClick(execActionFx),
        onDoubleClick(execActionFx),
        onOwnSpaceKeyDown(e => {
            e.preventDefault();
            e.stopPropagation();
        }),
        ...onSpaceOrEnter(execActionFx)
    ];
}
