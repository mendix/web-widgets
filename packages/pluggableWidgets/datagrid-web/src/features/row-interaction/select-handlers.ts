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
            return ctx.clickTrigger !== "single";
        }

        if (ctx.selectionMethod === "checkbox") {
            return event.metaKey || event.ctrlKey;
        }

        return false;
    },
    handler: ({ item, selectionMode }, event) => {
        let toggleMode = false;
        toggleMode ||= selectionMode === "toggle";
        toggleMode ||= event.metaKey;
        toggleMode ||= event.ctrlKey;

        selectFx(item, event.shiftKey, toggleMode);
    }
});

const onMouseDown = (
    handler: (ctx: CellContext, event: React.MouseEvent<Element>) => void
): EventCaseEntry<CellContext, Element, "onMouseDown"> => ({
    eventName: "onMouseDown",
    filter: ctx => ctx.selectionMethod !== "none",
    handler
});

const onSelectItemHotKey = (selectFx: SelectFx): EventCaseEntry<CellContext, HTMLDivElement, "onKeyUp"> => ({
    eventName: "onKeyUp",
    filter: (ctx, event) => ctx.selectionMethod !== "none" && isSelectOneTrigger(event),
    handler: ({ item }) => selectFx(item, false, true)
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
