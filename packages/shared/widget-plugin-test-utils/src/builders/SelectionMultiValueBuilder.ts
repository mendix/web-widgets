import type { ObjectItem, SelectionMultiValue } from "mendix";

type KeepSelectionPredicate = (item: ObjectItem) => boolean;

export class SelectionMultiValueBuilder {
    private selectionValue: SelectionMultiValue;
    private keepSelectionPredicate: KeepSelectionPredicate | undefined;

    constructor() {
        const builder = this;
        const value = {
            type: "Multi",
            selection: [] as ObjectItem[],
            setSelection(next: ObjectItem[]) {
                this.selection = next;
            },
            setKeepSelection(predicate: KeepSelectionPredicate | undefined): void {
                builder.keepSelectionPredicate = predicate;
            }
        };

        this.selectionValue = value as SelectionMultiValue;
    }

    build(): SelectionMultiValue {
        return this.selectionValue;
    }

    withSelected(items: ObjectItem[]): SelectionMultiValueBuilder {
        this.selectionValue.setSelection(items);
        return this;
    }

    /** Returns the predicate last passed to `setKeepSelection`, or `undefined` if none installed. */
    getKeepSelectionPredicate(): KeepSelectionPredicate | undefined {
        return this.keepSelectionPredicate;
    }
}
