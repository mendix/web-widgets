import { action, makeAutoObservable } from "mobx";
import { ColumnId } from "../../typings/GridColumn";

/**
 * MobX store for managing drag & drop state of column headers.
 * Tracks which column is being dragged and where it can be dropped.
 * @injectable
 */
export class HeaderDragnDropStore {
    private _dragOver: [ColumnId, "before" | "after"] | undefined = undefined;
    private _isDragging: [ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined = undefined;

    constructor() {
        makeAutoObservable(this, {
            setDragOver: action,
            setIsDragging: action,
            clearDragState: action
        });
    }

    get dragOver(): [ColumnId, "before" | "after"] | undefined {
        return this._dragOver;
    }

    get isDragging(): [ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined {
        return this._isDragging;
    }

    setDragOver(value: [ColumnId, "before" | "after"] | undefined): void {
        this._dragOver = value;
    }

    setIsDragging(value: [ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined): void {
        this._isDragging = value;
    }

    clearDragState(): void {
        this._dragOver = undefined;
        this._isDragging = undefined;
    }
}
