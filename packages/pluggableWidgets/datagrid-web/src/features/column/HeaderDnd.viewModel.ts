import { makeAutoObservable } from "mobx";
import {
    closestCenter,
    CollisionDetection,
    DragCancelEvent,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    UniqueIdentifier
} from "@dnd-kit/core";
import { CSS, Transform } from "@dnd-kit/utilities";
import { CSSProperties } from "react";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { ColumnGroupStore } from "../../helpers/state/ColumnGroupStore";
import { DropPlacement, HeaderDndStore } from "./HeaderDnd.store";

export class HeaderDndViewModel {
    constructor(
        private store: HeaderDndStore,
        private columnsStore: ColumnGroupStore
    ) {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get activeId(): ColumnId | undefined {
        return this.store.activeId;
    }

    get overId(): ColumnId | undefined {
        return this.store.overId;
    }

    get placement(): DropPlacement | undefined {
        return this.store.placement;
    }

    get isDragging(): boolean {
        return this.store.isDragging;
    }

    get activeColumn(): GridColumn | undefined {
        const activeId = this.store.activeId;
        if (!activeId) {
            return undefined;
        }
        return this.columnsStore.availableColumns.find(c => c.columnId === activeId);
    }

    /**
     * dnd-kit collision detection implementation.
     *
     * Kept here so barrier rules live with the DnD state/logic, not the view.
     */
    collisionDetection(args: Parameters<CollisionDetection>[0]): ReturnType<CollisionDetection> {
        // Use the full set of droppable containers for collision detection so
        // dnd-kit's sorting/animation calculations consider locked columns' positions.
        // We still prevent final drops on locked columns in `onDragOver`/`onDragEnd`.
        return closestCenter(args);
    }

    /**
     * Derive the inline style for a header cell based on sortable state.
     * Only draggable columns receive transform/transition styles to avoid
     * showing locked columns moving during a drag.
     */
    getHeaderCellStyle(
        columnId: ColumnId,
        options: { transform: Transform | null; transition: string | undefined }
    ): CSSProperties {
        const columns = this.columnsStore.visibleColumns;
        const idx = columns.findIndex(c => c.columnId === columnId);
        // If column doesn't exist or is locked (non-draggable)
        // do not apply transform/transition so it remains visually fixed during dnd.
        if (idx < 0 || !columns[idx].canDrag) {
            return {};
        }

        return {
            ...(options.transform ? { transform: CSS.Transform.toString(options.transform) } : null),
            ...(options.transition ? { transition: options.transition } : null)
        };
    }

    /**
     * Ids that are allowed to be used as "over" targets for the current active drag.
     * Returns undefined when not currently dragging.
     */
    private toColumnId(id: UniqueIdentifier | undefined): ColumnId | undefined {
        return typeof id === "string" ? (id as ColumnId) : undefined;
    }

    private computePlacement(active: ColumnId, over: ColumnId): DropPlacement | undefined {
        // Compute placement based on the indices of movable columns only so
        // locked (non-draggable / non-sortable) columns remain stationary during drags.
        const columns = this.columnsStore.visibleColumns;
        const movable = columns.filter(c => c.canDrag);
        const activeIndex = movable.findIndex(c => c.columnId === active);
        const overIndex = movable.findIndex(c => c.columnId === over);
        if (activeIndex < 0 || overIndex < 0) {
            return undefined;
        }
        return overIndex > activeIndex ? "after" : "before";
    }

    private isOverAllowed(over: ColumnId): boolean {
        const columns = this.columnsStore.visibleColumns;
        const overIndex = columns.findIndex(c => c.columnId === over);
        if (overIndex < 0) {
            return false;
        }

        // Can't drop onto a non-draggable column.
        const col = columns[overIndex];
        return Boolean(col.canDrag);
    }

    onDragStart(e: DragStartEvent): void {
        const activeId = this.toColumnId(e.active.id);
        if (activeId) {
            this.store.setActive(activeId);
        }
    }

    onDragOver(e: DragOverEvent): void {
        const activeId = this.toColumnId(e.active.id);
        const overId = this.toColumnId(e.over?.id);

        if (!activeId) {
            this.store.setOver(undefined, undefined);
            return;
        }

        if (!overId || activeId === overId) {
            this.store.setOver(undefined, undefined);
            return;
        }

        if (!this.isOverAllowed(overId)) {
            this.store.setOver(undefined, undefined);
            return;
        }

        this.store.setOver(overId, this.computePlacement(activeId, overId));
    }

    onDragEnd(e: DragEndEvent): void {
        const activeId = this.toColumnId(e.active.id);
        const overId = this.toColumnId(e.over?.id);

        if (!activeId) {
            this.store.clear();
            return;
        }

        if (overId && activeId !== overId && this.isOverAllowed(overId)) {
            const placement = this.computePlacement(activeId, overId);
            if (placement) {
                this.columnsStore.swapColumns(activeId, [overId, placement]);
            }
        }

        this.store.clear();
    }

    onDragCancel(_e: DragCancelEvent): void {
        this.store.clear();
    }
}
