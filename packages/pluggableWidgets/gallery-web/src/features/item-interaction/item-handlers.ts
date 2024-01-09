import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { EventEntryContext } from "./base";
import { SelectAllFx, SelectFx, onSelectAllHotKey } from "@mendix/widget-plugin-grid/selection";
import { blockUserSelect, removeAllRanges, unblockUserSelect } from "@mendix/widget-plugin-grid/selection/utils";

const onSelect = (selectFx: SelectFx): EventCaseEntry<EventEntryContext, HTMLDivElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => ctx.selectionType !== "None",
    handler: ({ item }, event) => {
        const useToggleMode = event.metaKey || event.ctrlKey;
        selectFx(item, event.shiftKey, useToggleMode);
    }
});

const onMouseDown = (
    handler: (ctx: EventEntryContext, event: React.MouseEvent<Element>) => void
): EventCaseEntry<EventEntryContext, Element, "onMouseDown"> => ({
    eventName: "onMouseDown",
    filter: ctx => ctx.selectionType !== "None",
    handler
});

export function createItemHandlers(
    selectFx: SelectFx,
    selectAllFx: SelectAllFx
): Array<ElementEntry<EventEntryContext, HTMLDivElement>> {
    return [
        onSelect(selectFx),
        onMouseDown(removeAllRanges),
        ...onSelectAllHotKey(
            () => {
                blockUserSelect();
                selectAllFx("selectAll");
            },
            () => {
                unblockUserSelect();
            }
        )
    ];
}
