import type { ActionValue, ListValue, ObjectItem, SelectionSingleValue, SelectionMultiValue } from "mendix";
import { useEffect, useRef } from "react";

class SingleSelectionHelper {
    type = "Single" as const;
    constructor(private selectionValue: SelectionSingleValue) {}

    updateProps(value: SelectionSingleValue): void {
        this.selectionValue = value;
    }

    isSelected(value: ObjectItem): boolean {
        return this.selectionValue.selection?.id === value.id;
    }
    add(value: ObjectItem): void {
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

        if (this._itemsEqual(this.selectableItems, items) === false) {
            this.selectableItems = items;
            this._resetRange();
        }
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

    private _setRangeEnd(item: ObjectItem | undefined): void {
        if (item === undefined) {
            this.rangeEnd = undefined;
            return;
        }

        const currentEnd = this.rangeEnd;
        const nextEnd = this.selectableItems.indexOf(item);
        this.rangeEnd = nextEnd > -1 ? nextEnd : undefined;

        this._updateSelectionWithRange(this.rangeStart, currentEnd, nextEnd);
    }

    private _updateSelectionWithRange(
        start: undefined | number,
        currentEnd: undefined | number,
        nextEnd: number
    ): void {
        if (start === undefined) {
            return;
        }

        if (nextEnd === -1) {
            return;
        }

        if (currentEnd === nextEnd) {
            return;
        }

        if (currentEnd === undefined) {
            const itemsToAdd = this._getRange(start, nextEnd);
            const selection = this._union(this.selectionValue.selection, itemsToAdd);
            // console.log(selection, itemsToAdd);
            this.selectionValue.setSelection(selection);
            return;
        }

        const itemsToRemove = this._getRange(start, currentEnd);
        const itemsToAdd = this._getRange(start, nextEnd);

        let selection = [...this.selectionValue.selection];
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
        const union = new Set(selection);

        for (const item of items) {
            union.add(item);
        }

        return Array.from(union);
    }

    private _diff(selection: ObjectItem[], items: ObjectItem[]): ObjectItem[] {
        const diff = new Set(selection);

        for (const item of items) {
            if (diff.has(item)) {
                diff.delete(item);
            }
        }

        return Array.from(diff);
    }

    private _itemsEqual(a: ObjectItem[], b: ObjectItem[]): boolean {
        if (a.length === b.length) {
            return a.every((obj, index) => obj.id === b[index].id);
        }
        return false;
    }

    selectAll(): void {
        this.selectionValue.setSelection(this.selectableItems);
    }

    selectNone(): void {
        this.selectionValue.setSelection([]);
    }

    selectUpTo(value: ObjectItem): void {
        if (this.rangeStart === undefined) {
            this._add(value);
            this._setRangeStart(value);
        } else {
            this._setRangeEnd(value);
        }
    }
}

const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

export function useSelectionHelper(
    selection: SelectionSingleValue | SelectionMultiValue | undefined,
    dataSource: ListValue,
    onSelectionChange: ActionValue | undefined
): SelectionHelper | undefined {
    const firstLoadDone = useRef(false);
    useEffect(() => {
        if (firstLoadDone.current) {
            onSelectionChange?.execute();
        }
    }, [selection?.selection, onSelectionChange]);
    useEffect(() => {
        if (dataSource?.status !== "loading") {
            firstLoadDone.current = true;
        }
    }, [dataSource?.status]);

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
export type MultiSelectionStatus = "none" | "all" | "some";
