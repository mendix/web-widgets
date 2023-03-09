import type { ObjectItem, SelectionMultiValue } from "mendix";

export class SelectionMultiValueBuilder {
    private selectionValue: SelectionMultiValue;

    constructor() {
        const value = {
            type: "Multi",
            selection: [] as ObjectItem[],
            setSelection(next: ObjectItem[]) {
                this.selection = next;
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
}
