import { ElementEntries, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import {
    SelectAllFx,
    SelectFx,
    isSelectOneTrigger,
    onOwnSpaceKeyUp,
    onSelectAllHotKey
} from "@mendix/widget-plugin-grid/selection";
import { blockUserSelect, unblockUserSelect } from "@mendix/widget-plugin-grid/selection/utils";
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

const onSelectItemHotKey = (selectFx: SelectFx): EventCaseEntry<CellContext, HTMLDivElement, "onKeyUp"> => ({
    eventName: "onKeyUp",
    filter: (ctx, event) => ctx.selectionMethod !== "none" && isSelectOneTrigger(event),
    handler: ({ item }) => selectFx(item, false)
});

export function createSelectHandlers(
    selectFx: SelectFx,
    selectAllFx: SelectAllFx
): Array<ElementEntries<CellContext, HTMLDivElement>> {
    return [
        onClick(selectFx),
        onSelectItemHotKey(selectFx),
        onOwnSpaceKeyUp(e => {
            e.preventDefault();
            e.stopPropagation();
        }),
        ...onSelectAllHotKey(
            () => {
                blockUserSelect();
                selectAllFx("selectAll");
            },
            () => unblockUserSelect()
        )
    ];
}
