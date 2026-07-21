import type { ObjectItem, SelectionSingleValue } from "mendix";

type KeepSelectionPredicate = (item: ObjectItem) => boolean;

export class SelectionSingleValueBuilder {
    private selectionValue: SelectionSingleValue;
    private keepSelectionPredicate: KeepSelectionPredicate | undefined;

    constructor() {
        const builder = this;
        const value = {
            type: "Single",
            selection: undefined as ObjectItem | undefined,
            setSelection(next: ObjectItem) {
                this.selection = next;
            },
            setKeepSelection(predicate: KeepSelectionPredicate | undefined): void {
                builder.keepSelectionPredicate = predicate;
            }
        };

        this.selectionValue = value as SelectionSingleValue;
    }

    build(): SelectionSingleValue {
        return this.selectionValue;
    }

    withSelected(items: ObjectItem): SelectionSingleValueBuilder {
        this.selectionValue.setSelection(items);
        return this;
    }

    /** Returns the predicate last passed to `setKeepSelection`, or `undefined` if none installed. */
    getKeepSelectionPredicate(): KeepSelectionPredicate | undefined {
        return this.keepSelectionPredicate;
    }
}
