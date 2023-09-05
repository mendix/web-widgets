import type { ObjectItem, SelectionSingleValue } from "mendix";

export class SelectionSingleValueBuilder {
    private selectionValue: SelectionSingleValue;

    constructor() {
        const value = {
            type: "Single",
            selection: undefined as ObjectItem | undefined,
            setSelection(next: ObjectItem) {
                this.selection = next;
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
}
