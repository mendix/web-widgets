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
            filter: (ctx, event) => {
                return ctx.clickTrigger !== "none" && (event.code === "Space" || event.code === "Enter");
            },
            handler: () => {
                pressed = true;
            }
        },
        {
            eventName: "onKeyUp",
            filter: (ctx, event) => {
                return ctx.clickTrigger !== "none" && (event.code === "Space" || event.code === "Enter") && pressed;
            },
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
