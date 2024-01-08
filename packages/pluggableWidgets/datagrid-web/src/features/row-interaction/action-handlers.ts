import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { ExecuteActionFx } from "../../helpers/ClickActionHelper";
import { CellContext } from "./base";
import { onOwnSpaceKeyDown } from "@mendix/widget-plugin-grid/selection";

const onClick = (execActionFx: ExecuteActionFx): EventCaseEntry<CellContext, HTMLDivElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => {
        return ctx.clickTrigger === "single" && (ctx.selectionMethod === "checkbox" || ctx.selectionMethod === "none");
    },
    handler: ({ item }) => execActionFx(item)
});

const onDoubleClick = (
    execActionFx: ExecuteActionFx
): EventCaseEntry<CellContext, HTMLDivElement, "onDoubleClick"> => ({
    eventName: "onDoubleClick",
    filter: ctx => ctx.clickTrigger === "double",
    handler: ({ item }) => execActionFx(item)
});

const canTriggerAction = (ctx: CellContext, event: React.KeyboardEvent): boolean => {
    if (event.code === "Space" && ctx.clickTrigger !== "none") {
        return ctx.selectionType === "None";
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
            filter: canTriggerAction,
            handler: () => (pressed = true)
        },
        {
            eventName: "onKeyUp",
            filter: (ctx, event) => canTriggerAction(ctx, event) && pressed,
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
