import type { ObjectItem, SelectionSingleValue } from "mendix";
import { Writable } from "./type-utils.js";

/**
 * Builds `SelectionSingleValue` mocks that behave like the Mendix client: a built value never changes.
 * `setSelection` records the call and updates this builder, so the next `build()` returns a new object
 * with the new selection, which is the object the client would pass on the next render.
 */
export class SelectionSingleValueBuilder {
    private readonly selectionValue: Writable<SelectionSingleValue> = {
        type: "Single",
        selection: undefined,
        setSelection: jest.fn((next: ObjectItem | undefined) => {
            this.withSelected(next);
        }),
        setKeepSelection: jest.fn()
    };

    build(): SelectionSingleValue {
        return { ...this.selectionValue };
    }

    withSelected(item: ObjectItem | undefined): SelectionSingleValueBuilder {
        this.selectionValue.selection = item;
        return this;
    }
}
