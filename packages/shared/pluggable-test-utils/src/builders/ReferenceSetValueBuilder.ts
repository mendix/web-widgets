import type { ObjectItem, ReferenceSetValue, Option } from "mendix";
import type { Big } from "big.js";
import { Status } from "../constants.js";

type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};

export class ReferenceSetValueBuilder<T extends string | boolean | Date | Big> {
    private readonly referenceSetValue: Writable<ReferenceSetValue> = {
        value: undefined,
        type: "ReferenceSet",
        status: Status.Available,
        validation: undefined,
        readOnly: false,
        setValidator: jest.fn(),
        setValue: jest.fn(value => this.withValue(value))
    };

    withValue(value: Option<ObjectItem[]>): ReferenceSetValueBuilder<T> {
        this.referenceSetValue.value = value;
        return this;
    }

    isReadOnly(): ReferenceSetValueBuilder<T> {
        this.referenceSetValue.readOnly = true;
        return this;
    }

    isLoading(): ReferenceSetValueBuilder<T> {
        this.referenceSetValue.status = Status.Loading;
        return this.isReadOnly();
    }

    isUnavailable(): ReferenceSetValueBuilder<T> {
        this.referenceSetValue.status = Status.Unavailable;
        return this.isReadOnly();
    }

    withValidation(validation?: string): ReferenceSetValueBuilder<T> {
        this.referenceSetValue.validation = validation;
        return this;
    }

    build(): ReferenceSetValue {
        return this.referenceSetValue;
    }
}
