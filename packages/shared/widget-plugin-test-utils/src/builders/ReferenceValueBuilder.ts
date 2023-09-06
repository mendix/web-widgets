import type { ObjectItem, ReferenceValue, Option } from "mendix";
import type { Big } from "big.js";
import { Status } from "../constants.js";

type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};

export class ReferenceValueBuilder<T extends string | boolean | Date | Big> {
    private readonly referenceValue: Writable<ReferenceValue> = {
        value: undefined,
        type: "Reference",
        status: Status.Available,
        validation: undefined,
        readOnly: false,
        setValidator: jest.fn(),
        setValue: jest.fn(value => this.withValue(value))
    };

    withValue(value: Option<ObjectItem>): ReferenceValueBuilder<T> {
        this.referenceValue.value = value;
        return this;
    }

    isReadOnly(): ReferenceValueBuilder<T> {
        this.referenceValue.readOnly = true;
        return this;
    }

    isLoading(): ReferenceValueBuilder<T> {
        this.referenceValue.status = Status.Loading;
        return this.isReadOnly();
    }

    isUnavailable(): ReferenceValueBuilder<T> {
        this.referenceValue.status = Status.Unavailable;
        return this.isReadOnly();
    }

    withValidation(validation?: string): ReferenceValueBuilder<T> {
        this.referenceValue.validation = validation;
        return this;
    }

    build(): ReferenceValue {
        return this.referenceValue;
    }
}
