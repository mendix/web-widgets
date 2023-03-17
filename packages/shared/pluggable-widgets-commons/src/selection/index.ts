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

class MultiSelectionHelper {
    type = "Multi" as const;
    constructor(private selectionValue: SelectionMultiValue, private selectableItems: ObjectItem[]) {}

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
        if (!this.isSelected(value)) {
            this.selectionValue.setSelection(this.selectionValue.selection.concat(value));
        }
    }

    remove(value: ObjectItem): void {
        if (this.isSelected(value)) {
            this.selectionValue.setSelection(this.selectionValue.selection.filter(obj => obj.id !== value.id));
        }
    }

    selectAll(): void {
        this.selectionValue.setSelection(this.selectableItems);
    }
    selectNone(): void {
        this.selectionValue.setSelection([]);
    }
}

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
    }, [selection?.selection]);
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
export type { MultiSelectionHelper };
export type SelectionHelper = SingleSelectionHelper | MultiSelectionHelper;
export type MultiSelectionStatus = "none" | "all" | "some";
