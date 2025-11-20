import { makeAutoObservable } from "mobx";
import { DragEvent, DragEventHandler } from "react";
import { HeaderDragnDropStore } from "./HeaderDragnDrop.store";
import { ColumnId } from "../../typings/GridColumn";
import { ColumnGroupStore } from "../../helpers/state/ColumnGroupStore";

/**
 * View model for a single column header drag & drop interactions.
 * Encapsulates previous `useDraggable` hook logic and uses MobX store for shared drag state.
 */
export class ColumnHeaderViewModel {
    private readonly dndStore: HeaderDragnDropStore;
    private readonly columnsStore: ColumnGroupStore;
    private readonly columnsDraggable: boolean;

    constructor(params: { dndStore: HeaderDragnDropStore; columnsStore: ColumnGroupStore; columnsDraggable: boolean }) {
        this.dndStore = params.dndStore;
        this.columnsStore = params.columnsStore;
        this.columnsDraggable = params.columnsDraggable;
        makeAutoObservable(this);
    }

    get dropTarget(): [ColumnId, "before" | "after"] | undefined {
        return this.dndStore.dragOver;
    }

    get dragging(): [ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined {
        return this.dndStore.isDragging;
    }

    /** Handlers exposed to the component. */
    get draggableProps(): {
        draggable?: boolean;
        onDragStart?: DragEventHandler;
        onDragOver?: DragEventHandler;
        onDrop?: DragEventHandler;
        onDragEnter?: DragEventHandler;
        onDragEnd?: DragEventHandler;
    } {
        if (!this.columnsDraggable) {
            return {};
        }
        return {
            draggable: true,
            onDragStart: this.handleDragStart,
            onDragOver: this.handleDragOver,
            onDrop: this.handleOnDrop,
            onDragEnter: this.handleDragEnter,
            onDragEnd: this.handleDragEnd
        };
    }

    private handleDragStart = (e: DragEvent<HTMLDivElement>): void => {
        const elt = (e.target as HTMLDivElement).closest(".th") as HTMLDivElement;
        if (!elt) {
            return;
        }
        const columnId = (elt.dataset.columnId ?? "") as ColumnId;
        const columnAtTheLeft = (elt.previousElementSibling as HTMLDivElement)?.dataset?.columnId as ColumnId;
        const columnAtTheRight = (elt.nextElementSibling as HTMLDivElement)?.dataset?.columnId as ColumnId;
        this.dndStore.setIsDragging([columnAtTheLeft, columnId, columnAtTheRight]);
    };

    private handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
        const dragging = this.dragging;
        if (!dragging) {
            return;
        }
        const columnId = (e.currentTarget as HTMLDivElement).dataset.columnId as ColumnId;
        if (!columnId) {
            return;
        }
        e.preventDefault();
        const [leftSiblingColumnId, draggingColumnId, rightSiblingColumnId] = dragging;
        if (columnId === draggingColumnId) {
            if (this.dropTarget !== undefined) {
                this.dndStore.setDragOver(undefined);
            }
            return;
        }
        let isAfter: boolean;
        if (columnId === leftSiblingColumnId) {
            isAfter = false;
        } else if (columnId === rightSiblingColumnId) {
            isAfter = true;
        } else {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            isAfter = rect.width / 2 + (this.dropTarget?.[1] === "after" ? -10 : 10) < e.clientX - rect.left;
        }
        const newPosition: "before" | "after" = isAfter ? "after" : "before";
        if (columnId !== this.dropTarget?.[0] || newPosition !== this.dropTarget?.[1]) {
            this.dndStore.setDragOver([columnId, newPosition]);
        }
    };

    private handleDragEnter = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
    };

    private handleDragEnd = (): void => {
        this.dndStore.clearDragState();
    };

    private handleOnDrop = (_e: DragEvent<HTMLDivElement>): void => {
        const dragging = this.dragging;
        const dropTarget = this.dropTarget;
        this.handleDragEnd();
        if (!dragging || !dropTarget) {
            return;
        }
        // Reorder columns using existing columns store logic
        this.columnsStore.swapColumns(dragging[1], dropTarget);
    };
}
