import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { SelectAllFx, SelectFx, onSelectAllHotKey } from "@mendix/widget-plugin-grid/selection";
import { CheckboxContext } from "./base";
import { blockUserSelect, unblockUserSelect } from "@mendix/widget-plugin-grid/selection/utils";

const onClick = (selectFx: SelectFx): EventCaseEntry<CheckboxContext, HTMLInputElement, "onClick"> => ({
    eventName: "onClick",
    filter: ctx => ctx.selectionMethod === "checkbox",
    handler: ({ item }, event) => selectFx(item, event.shiftKey)
});

export function checkboxHandlers(
    selectFx: SelectFx,
    selectAllFx: SelectAllFx
): Array<ElementEntry<CheckboxContext, HTMLInputElement>> {
    return [
        onClick(selectFx),
        ...onSelectAllHotKey(
            () => {
                blockUserSelect();
                selectAllFx("selectAll");
            },
            () => unblockUserSelect()
        )
    ];
}
