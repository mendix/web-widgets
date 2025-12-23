import { makeAutoObservable } from "mobx";
import { ColumnId } from "../../typings/GridColumn";

export type DropPlacement = "before" | "after";

export class HeaderDndStore {
    activeId: ColumnId | undefined = undefined;
    overId: ColumnId | undefined = undefined;
    placement: DropPlacement | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    get isDragging(): boolean {
        return Boolean(this.activeId);
    }

    setActive(id: ColumnId | undefined): void {
        this.activeId = id;
    }

    setOver(overId: ColumnId | undefined, placement: DropPlacement | undefined): void {
        this.overId = overId;
        this.placement = placement;
    }

    clear(): void {
        this.activeId = undefined;
        this.overId = undefined;
        this.placement = undefined;
    }
}
