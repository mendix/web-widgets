import { ObjectItem } from "mendix";
import { MoveEvent1D, MoveEvent2D, MultiSelectionStatus, SelectionMode } from "../selection/types";

export interface MultiSelectionService {
    type: "Multi";
    selectionStatus: MultiSelectionStatus;
    isSelected(item: ObjectItem): boolean;
    add(item: ObjectItem): void;
    remove(item: ObjectItem): void;
    reduceTo(item: ObjectItem): void;
    clearSelection(): void;
    selectAll(): void;
    selectNone(): void;
    selectUpTo(item: ObjectItem, mode: SelectionMode): void;
    selectUpToAdjacent(
        item: ObjectItem,
        shiftKey: boolean,
        mode: SelectionMode,
        event: MoveEvent1D | MoveEvent2D
    ): void;
    togglePageSelection(): void;
}
