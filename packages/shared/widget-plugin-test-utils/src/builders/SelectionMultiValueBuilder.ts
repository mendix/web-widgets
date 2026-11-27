import type { ObjectItem, SelectionMultiValue } from "mendix";
import { Writable } from "./type-utils.js";

/**
 * Builds `SelectionMultiValue` mocks that behave like the Mendix client: a built value never changes.
 * `setSelection` records the call and updates this builder, so the next `build()` returns a new object
 * with the new selection, which is the object the client would pass on the next render.
 */
export class SelectionMultiValueBuilder {
    private readonly selectionValue: Writable<SelectionMultiValue> = {
        type: "Multi",
        selection: [],
        setSelection: jest.fn((next: ObjectItem[]) => {
            this.withSelected(next);
        }),
        setKeepSelection: jest.fn()
    };

    build(): SelectionMultiValue {
        return { ...this.selectionValue };
    }

    withSelected(items: ObjectItem[]): SelectionMultiValueBuilder {
        this.selectionValue.selection = items;
        return this;
    }
}
