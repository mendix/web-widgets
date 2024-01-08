import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import {
    SelectAdjacentFx,
    SelectAllFx,
    SelectFx,
    isSelectOneTrigger,
    onSelectAdjacentHotKey,
    onSelectAllHotKey
} from "@mendix/widget-plugin-grid/selection";
import { blockUserSelect, removeAllRanges, unblockUserSelect } from "@mendix/widget-plugin-grid/selection/utils";
import { CellContext } from "./base";

const onSelect = (selectFx: SelectFx): EventCaseEntry<CellContext, HTMLDivElement, "onClick"> => ({
    eventName: "onClick",
    filter: (ctx, event) => {
        if (ctx.selectionMethod === "rowClick") {
            return ctx.clickTrigger === "double" ? event.metaKey || event.ctrlKey : ctx.clickTrigger === "none";
        }

        if (ctx.selectionMethod === "checkbox") {
            return event.metaKey || event.ctrlKey;
        }

        return false;
    },
    handler: ({ item }, event) => selectFx(item, event.shiftKey)
});

const onMouseDown = (
    handler: (ctx: CellContext, event: React.MouseEvent<Element>) => void
): EventCaseEntry<CellContext, Element, "onMouseDown"> => ({
    eventName: "onMouseDown",
    filter: ctx => {
        return ctx.selectionMethod !== "none" && (ctx.clickTrigger === "none" || ctx.clickTrigger === "double");
    },
    handler
});

const onSelectItemHotKey = (selectFx: SelectFx): EventCaseEntry<CellContext, HTMLDivElement, "onKeyUp"> => ({
    eventName: "onKeyUp",
    filter: (ctx, event) => ctx.selectionMethod !== "none" && isSelectOneTrigger(event),
    handler: ({ item }) => selectFx(item, false)
});

export function createSelectHandlers(
    selectFx: SelectFx,
    selectAllFx: SelectAllFx,
    selectAdjacentFx: SelectAdjacentFx
): Array<ElementEntry<CellContext, HTMLDivElement>> {
    return [
        onMouseDown(removeAllRanges),
        onSelect(selectFx),
        onSelectItemHotKey(selectFx),
        onSelectAllHotKey(
            () => {
                blockUserSelect();
                selectAllFx("selectAll");
            },
            () => unblockUserSelect()
        ),
        onSelectAdjacentHotKey(selectAdjacentFx)
    ].flat();
}
