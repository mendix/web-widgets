import { ObjectItem } from "mendix";
import { SelectAdjacentFx, SelectAllFx, SelectFx, SelectionType } from "../selection";

export interface SelectActionsService {
    selectionType: SelectionType;
    select: SelectFx;
    selectPage: SelectAllFx;
    selectAdjacent: SelectAdjacentFx;
    isSelected(item: ObjectItem): boolean;
    clearSelection(): void;
}
