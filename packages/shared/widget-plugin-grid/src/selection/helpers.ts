import type { ActionValue, ListValue, ObjectItem, SelectionSingleValue, SelectionMultiValue } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { useEffect, useRef } from "react";
import { Direction, MultiSelectionStatus, ScrollKeyCode, SelectionMode, Size, MoveEvent1D, MoveEvent2D } from "./types";

class SingleSelectionHelper {
    type = "Single" as const;
    constructor(private selectionValue: SelectionSingleValue) {}

    updateProps(value: SelectionSingleValue): void {
        this.selectionValue = value;
    }

    isSelected(value: ObjectItem): boolean {
        return this.selectionValue.selection?.id === value.id;
    }
    reduceTo(value: ObjectItem): void {
        this.selectionValue.setSelection(value);
    }
    remove(_value: ObjectItem): void {
        this.selectionValue.setSelection(undefined);
    }
}

export class MultiSelectionHelper {
    type = "Multi" as const;
    private rangeStart: number | undefined;
    private rangeEnd: number | undefined;

    constructor(private selectionValue: SelectionMultiValue, private selectableItems: ObjectItem[]) {
        this.rangeStart = undefined;
    }

    isSelected(value: ObjectItem): boolean {
        return this.selectionValue.selection.some(obj => obj.id === value.id);
    }

    updateProps(value: SelectionMultiValue, items: ObjectItem[]): void {
        this.selectionValue = value;
        this.selectableItems = items;
    }

    get selectionStatus(): MultiSelectionStatus {
        return this.selectionValue.selection.length === 0
            ? "none"
            : this.selectionValue.selection.length === this.selectableItems.length
            ? "all"
            : "some";
    }

    add(value: ObjectItem): void {
        this._add(value);
        this._setRangeStart(value);
        this._setRangeEnd(undefined);
    }

    remove(value: ObjectItem): void {
        if (this.isSelected(value)) {
            this.selectionValue.setSelection(this.selectionValue.selection.filter(obj => obj.id !== value.id));
        }
        this._resetRange();
    }

    reduceTo(value: ObjectItem): void {
        this.selectionValue.setSelection([value]);
        this._setRangeStart(value);
        this._setRangeEnd(undefined);
    }

    private _add(value: ObjectItem): void {
        if (!this.isSelected(value)) {
            this.selectionValue.setSelection(this.selectionValue.selection.concat(value));
        }
    }

    private _setRangeStart(item: ObjectItem | undefined): void {
        let index = -1;
        if (item !== undefined) {
            index = this.selectableItems.indexOf(item);
        }
        this.rangeStart = index > -1 ? index : undefined;
    }

    private _setRangeEnd(item: undefined): void;
    private _setRangeEnd(item: ObjectItem, mode: SelectionMode): void;
    private _setRangeEnd(...params: [undefined] | [ObjectItem, SelectionMode]): void {
        if (params.length === 1) {
            this.rangeEnd = undefined;
            return;
        }

        const [item, selectionMode] = params;
        const prevEnd = this.rangeEnd;
        const newEnd = this.selectableItems.indexOf(item);
        this.rangeEnd = newEnd > -1 ? newEnd : undefined;

        this._updateSelectionWithRange({
            start: this.rangeStart,
            end: prevEnd,
            newEnd,
            selectionMode
        });
    }

    private _updateSelectionWithRange(params: {
        /** Start index of the range */
        start: number | undefined;
        /** End index of the range */
        end: number | undefined;
        /** New end index of the range */
        newEnd: number;
        selectionMode: SelectionMode;
    }): void {
        const { start, end, newEnd, selectionMode } = params;
        const isToggleMode = selectionMode === "toggle";

        if (start === undefined || newEnd === -1 || end === newEnd) {
            return;
        }

        if (end === undefined) {
            let newSelection = this._getRange(start, newEnd);
            newSelection = isToggleMode ? this._union(this.selectionValue.selection, newSelection) : newSelection;
            this.selectionValue.setSelection(newSelection);
            return;
        }

        const itemsToRemove = this._getRange(start, end);
        const itemsToAdd = this._getRange(start, newEnd);

        let selection: ObjectItem[] = isToggleMode ? [...this.selectionValue.selection] : [];
        selection = this._diff(selection, itemsToRemove);
        selection = this._union(selection, itemsToAdd);
        this.selectionValue.setSelection(selection);
    }

    private _getRange(start: number, end: number): ObjectItem[] {
        const len = this.selectableItems.length;
        const [s, e] = [clamp(start, 0, len), clamp(end, 0, len)].sort((a, b) => a - b);
        return this.selectableItems.slice(s, e + 1);
    }

    private _resetRange(): void {
        this._setRangeStart(undefined);
        this._setRangeEnd(undefined);
    }

    private _union(selection: ObjectItem[], items: ObjectItem[]): ObjectItem[] {
        const union = [...selection];
        const ids = new Set(selection.map(o => o.id));

        for (const item of items) {
            if (ids.has(item.id)) {
                continue;
            }
            ids.add(item.id);
            union.push(item);
        }

        return union;
    }

    private _diff(selection: ObjectItem[], items: ObjectItem[]): ObjectItem[] {
        const diff = new Set(selection);
        const idsToDelete = new Set(items.map(o => o.id));

        for (const item of diff) {
            if (idsToDelete.has(item.id)) {
                diff.delete(item);
            }
        }

        return Array.from(diff);
    }

    selectAll(): void {
        this.selectionValue.setSelection(this.selectableItems);
        this._resetRange();
    }

    selectNone(): void {
        this.selectionValue.setSelection([]);
        this._resetRange();
    }

    selectUpTo(value: ObjectItem, selectionMode: SelectionMode): void {
        if (this.rangeStart === undefined) {
            this._add(value);
            this._setRangeStart(value);
        } else {
            this._setRangeEnd(value, selectionMode);
        }
    }

    _findIndexInList(index: number, direction: Direction, size: Size): number {
        const first = 0;
        const last = this.selectableItems.length - 1;
        const isForward = direction === "forward";

        if (size === "edge") {
            return isForward ? last : first;
        }

        const result = isForward ? index + size : index - size;

        return clamp(result, first, last);
    }

    _findIndexInGrid(index: number, keycode: ScrollKeyCode, numberOfColumns: number): number {
        const { columnIndex } = getColumnAndRowBasedOnIndex(numberOfColumns, this.selectableItems.length, index);

        if (keycode === "PageDown") {
            return this.selectableItems.length - (numberOfColumns - columnIndex);
        }

        if (keycode === "Home") {
            return index - columnIndex;
        }

        if (keycode === "End") {
            return index + (numberOfColumns - (columnIndex + 1));
        }

        return columnIndex;
    }

    selectUpToAdjacent(
        value: ObjectItem,
        shiftKey: boolean,
        mode: SelectionMode,
        event: MoveEvent1D | MoveEvent2D
    ): void {
        if (shiftKey === false) {
            this._resetRange();
            return;
        }

        const currentIndex = this.selectableItems.findIndex(item => item.id === value.id);
        let adjacentIndex: number = -1;

        if ("direction" in event) {
            adjacentIndex = this._findIndexInList(currentIndex, event.direction, event.size);
        } else {
            adjacentIndex = this._findIndexInGrid(currentIndex, event.code, event.numberOfColumns);
        }

        if (adjacentIndex === currentIndex) {
            return;
        }

        if (this.rangeStart === undefined) {
            this._setRangeStart(value);
        }
        const endItem = this.selectableItems.at(adjacentIndex);

        if (!endItem) {
            return;
        }

        this._setRangeEnd(endItem, mode);
    }
}

const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

export function useSelectionHelper(
    selection: SelectionSingleValue | SelectionMultiValue | undefined,
    dataSource: ListValue,
    onSelectionChange: ActionValue | undefined
): SelectionHelper | undefined {
    const prevObjectListRef = useRef<ObjectItem[]>([]);
    const firstLoadDone = useRef(false);
    firstLoadDone.current ||= dataSource?.status !== "loading";

    useEffect(() => {
        const prevObjectList = prevObjectListRef.current;
        const current = selection?.selection ?? [];
        const currentObjectList = Array.isArray(current) ? current : [current];
        if (objectListEqual(prevObjectList, currentObjectList)) {
            return;
        } else {
            prevObjectListRef.current = currentObjectList;
        }
        if (firstLoadDone.current) {
            executeAction(onSelectionChange);
        }
    }, [selection?.selection, onSelectionChange]);

    const selectionHelper = useRef<SelectionHelper | undefined>(undefined);

    if (selection !== undefined) {
        if (selection.type === "Single") {
            if (!selectionHelper.current) {
                selectionHelper.current = new SingleSelectionHelper(selection);
            } else {
                (selectionHelper.current as SingleSelectionHelper).updateProps(selection);
            }
        } else {
            if (!selectionHelper.current) {
                selectionHelper.current = new MultiSelectionHelper(selection, dataSource.items ?? []);
            } else {
                (selectionHelper.current as MultiSelectionHelper).updateProps(selection, dataSource.items ?? []);
            }
        }
    }

    return selectionHelper.current;
}

export type { SingleSelectionHelper };
export type SelectionHelper = SingleSelectionHelper | MultiSelectionHelper;

function objectListEqual(a: ObjectItem[], b: ObjectItem[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    const setB = new Set(b.map(obj => obj.id));
    return a.every(obj => setB.has(obj.id));
}

export type PositionInGrid = {
    columnIndex: number;
    rowIndex: number;
};

/**
 * Given an index and number of columns,
 * this function returns which row the index is located in a grid.
 * @function getRowBasedOnItemIndex
 * @param {number} index - The index used to find the row.
 * @param {number} numberOfColumns - The number of columns of the grid.
 * @return {number}
 *
 */
function getRowBasedOnItemIndex(index: number, numberOfColumns: number): number {
    return Math.floor(index / numberOfColumns);
}

/**
 * @typedef {Object} PositionInGrid
 * @property {number} columnIndex - The position in the columns for the given index
 * @property {number} rowIndex - The position in the row for the given index
 */

/**
 * Given the number of columns, total items displayed and an index,
 * this function returns the position (column and row) of the index in a 2D grid.
 * @function getColumnAndRowBasedOnIndex
 * @param {number} numberOfColumns - The number of columns of the grid.
 * @param {number} totalItems - The number of items displayed in the grid.
 * @param {number} index - The position of the item in the total items array.
 * @return {PositionInGrid}
 *
 */
export function getColumnAndRowBasedOnIndex(
    numberOfColumns: number,
    totalItems: number,
    index: number
): PositionInGrid {
    if (index < 0 || index >= totalItems) {
        return { columnIndex: -1, rowIndex: -1 };
    }

    const columnIndex = index % numberOfColumns;
    const rowIndex = getRowBasedOnItemIndex(index, numberOfColumns);
    return { columnIndex, rowIndex };
}
