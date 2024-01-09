import { useMemo } from "react";
import { ItemEventsController } from "./ItemEventsController";
import { ItemSelectHelper } from "../../helpers/ItemSelectHelper";

export function useItemEventsController(selectHelper: ItemSelectHelper): ItemEventsController {
    return useMemo(
        () =>
            new ItemEventsController(
                item => ({ item, selectionType: selectHelper.selectionType }),
                selectHelper.onSelect,
                selectHelper.onSelectAll
            ),
        [selectHelper]
    );
}
