import type { ActionValue, ListValue, ObjectItem, SelectionSingleValue, SelectionMultiValue } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { useEffect, useRef } from "react";
import { MultiSelectionStatus } from "./types";

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

    constructor(
        private selectionValue: SelectionMultiValue,
        private selectableItems: ObjectItem[],
        private readonly pageSize: number
    ) {
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

    _getAdjacentIndex(index: number, direction: "backward" | "forward", unit: "item" | "page" | "edge"): number {
        const first = 0;
        const last = this.selectableItems.length - 1;
        const isForward = direction === "forward";

        if (unit === "edge") {
            return isForward ? last : first;
        }

        let result: number;
        if (unit === "page") {
            result = isForward ? index + this.pageSize : index - this.pageSize;
        } else {
            result = isForward ? index + 1 : index - 1;
        }

        return Math.max(0, Math.min(result, last));
    }

    selectUpToAdjacent(
        value: ObjectItem,
        shiftKey: boolean,
        direction: "backward" | "forward",
        unit: "item" | "page" | "edge"
    ): void {
        if (shiftKey === false) {
            this._resetRange();
            return;
        }

        const currentIndex = this.selectableItems.findIndex(item => item.id === value.id);
        const adjacentIndex = this._getAdjacentIndex(currentIndex, direction, unit);

        if (adjacentIndex === currentIndex) {
            return;
        }

        if (this.rangeStart === undefined) {
            this._setRangeStart(value);
        }

        this._setRangeEnd(this.selectableItems.at(adjacentIndex));
    }
}

const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

export function useSelectionHelper(
    selection: SelectionSingleValue | SelectionMultiValue | undefined,
    dataSource: ListValue,
    onSelectionChange: ActionValue | undefined,
    pageSize: number
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
                selectionHelper.current = new MultiSelectionHelper(selection, dataSource.items ?? [], pageSize);
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
