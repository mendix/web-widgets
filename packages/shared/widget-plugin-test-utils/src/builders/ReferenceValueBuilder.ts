import type { ObjectItem, Option, ReferenceValue } from "mendix";
import { Status } from "../constants.js";
import { Writable } from "./type-utils.js";

/**
 * Builds `ReferenceValue` mocks that behave like the Mendix client: a built value never changes.
 * `setValue` records the call and updates this builder, so the next `build()` returns a new object
 * with the new value, which is the object the client would pass on the next render.
 */
export class ReferenceValueBuilder {
    private readonly referenceValue: Writable<ReferenceValue> = {
        value: undefined,
        type: "Reference",
        status: Status.Available,
        validation: undefined,
        readOnly: false,
        setValidator: jest.fn(),
        setValue: jest.fn(value => {
            this.withValue(value);
        })
    };

    withValue(value: Option<ObjectItem>): ReferenceValueBuilder {
        this.referenceValue.value = value;
        return this;
    }

    isReadOnly(): ReferenceValueBuilder {
        this.referenceValue.readOnly = true;
        return this;
    }

    isLoading(): ReferenceValueBuilder {
        this.referenceValue.status = Status.Loading;
        return this.isReadOnly();
    }

    isUnavailable(): ReferenceValueBuilder {
        this.referenceValue.status = Status.Unavailable;
        return this.isReadOnly();
    }

    withValidation(validation?: string): ReferenceValueBuilder {
        this.referenceValue.validation = validation;
        return this;
    }

    build(): ReferenceValue {
        return { ...this.referenceValue };
    }
}
