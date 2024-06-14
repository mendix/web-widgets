import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { EventEntryContext } from "./base";
import {
    SelectAdjacentFx,
    SelectAllFx,
    SelectFx,
    onSelectGridAdjacentHotKey,
    onSelectAllHotKey,
    isSelectOneTrigger
} from "@mendix/widget-plugin-grid/selection";
import { blockUserSelect, removeAllRanges, unblockUserSelect } from "@mendix/widget-plugin-grid/selection/utils";

const onMouseDown = (
    handler: (ctx: EventEntryContext, event: React.MouseEvent<Element>) => void
): EventCaseEntry<EventEntryContext, Element, "onMouseDown"> => ({
    eventName: "onMouseDown",
    filter: ctx => ctx.selectionType !== "None",
    handler
});

const onSelect = (selectFx: SelectFx): EventCaseEntry<EventEntryContext, HTMLDivElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => ctx.selectionType !== "None",
    handler: ({ item, selectionMode }, event) => {
        let toggleMode = false;
        toggleMode ||= selectionMode === "toggle";
        toggleMode ||= event.metaKey;
        toggleMode ||= event.ctrlKey;
        selectFx(item, event.shiftKey, toggleMode);
    }
});

const onSelectItemHotKey = (selectFx: SelectFx): EventCaseEntry<EventEntryContext, HTMLDivElement, "onKeyUp"> => ({
    eventName: "onKeyUp",
    filter: (ctx, event) => ctx.selectionType !== "None" && isSelectOneTrigger(event),
    handler: ({ item }) => selectFx(item, false, true)
});

/** An entry that adds a filter that ignores events from the input/textarea. */
function createArrowInputHandler(
    entries: Array<EventCaseEntry<EventEntryContext, Element, "onKeyDown">>
): EventCaseEntry<EventEntryContext, Element, "onKeyDown"> {
    return {
        eventName: "onKeyDown",
        filter: (_ctx, event) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return false;
            }
            return true;
        },
        handler: (ctx, event) => {
            for (const entry of entries) {
                if (entry.filter?.(ctx, event) ?? true) {
                    entry.handler(ctx, event);
                }
            }
        }
    };
}

export function createItemHandlers(
    selectFx: SelectFx,
    selectAllFx: SelectAllFx,
    selectAdjacentFx: SelectAdjacentFx,
    numberOfColumns: number
): Array<ElementEntry<EventEntryContext, HTMLDivElement>> {
    return [
        onMouseDown(removeAllRanges),
        onSelect(selectFx),
        onSelectItemHotKey(selectFx),
        onSelectAllHotKey(
            () => {
                blockUserSelect();
                selectAllFx("selectAll");
            },
            () => {
                unblockUserSelect();
            }
        ),
        createArrowInputHandler(onSelectGridAdjacentHotKey(selectAdjacentFx, numberOfColumns))
    ].flat();
}
