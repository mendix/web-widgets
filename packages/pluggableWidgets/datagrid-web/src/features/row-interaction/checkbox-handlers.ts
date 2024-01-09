import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import {
    SelectAdjacentFx,
    SelectAllFx,
    SelectFx,
    onSelectAdjacentHotKey,
    onSelectAllHotKey
} from "@mendix/widget-plugin-grid/selection";
import { CheckboxContext } from "./base";
import { blockUserSelect, unblockUserSelect } from "@mendix/widget-plugin-grid/selection/utils";

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
