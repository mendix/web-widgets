import type { ObjectItem, ReferenceSetValue, Option } from "mendix";
import { Status } from "../constants.js";
import { Writable } from "./type-utils.js";

export class ReferenceSetValueBuilder {
    private readonly referenceSetValue: Writable<ReferenceSetValue> = {
        value: undefined,
        type: "ReferenceSet",
        status: Status.Available,
        validation: undefined,
        readOnly: false,
        setValidator: jest.fn(),
        setValue: jest.fn(value => this.withValue(value))
    };

    withValue(value: Option<ObjectItem[]>): ReferenceSetValueBuilder {
        this.referenceSetValue.value = value;
        return this;
    }

    isReadOnly(): ReferenceSetValueBuilder {
        this.referenceSetValue.readOnly = true;
        return this;
    }

    isLoading(): ReferenceSetValueBuilder {
        this.referenceSetValue.status = Status.Loading;
        return this.isReadOnly();
    }

    isUnavailable(): ReferenceSetValueBuilder {
        this.referenceSetValue.status = Status.Unavailable;
        return this.isReadOnly();
    }

    withValidation(validation?: string): ReferenceSetValueBuilder {
        this.referenceSetValue.validation = validation;
        return this;
    }

    build(): ReferenceSetValue {
        return this.referenceSetValue;
    }
}
