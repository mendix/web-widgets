import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import {
    onSelectAdjacentHotKey,
    onSelectAllHotKey,
    SelectAdjacentFx,
    SelectAllFx,
    SelectFx
} from "@mendix/widget-plugin-grid/selection";
import { blockUserSelect, unblockUserSelect } from "@mendix/widget-plugin-grid/selection/utils";
import { CheckboxContext } from "./base";

const onClick = (selectFx: SelectFx): EventCaseEntry<CheckboxContext, HTMLInputElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => ctx.selectionMethod === "checkbox",
    handler: ({ item }, event) => selectFx(item, event.shiftKey, true)
});

export function checkboxHandlers(
    selectFx: SelectFx,
    selectAllFx: SelectAllFx,
    selectAdjacentFx: SelectAdjacentFx
): Array<ElementEntry<CheckboxContext, HTMLInputElement>> {
    return [
        onClick(selectFx),
        ...onSelectAdjacentHotKey(selectAdjacentFx),
        ...onSelectAllHotKey(
            () => {
                blockUserSelect();
                selectAllFx("selectAll");
            },
            () => unblockUserSelect()
        )
    ];
}
