import type { ObjectItem, ReferenceValue, Option } from "mendix";
import { Status } from "../constants.js";
import { Writable } from "./type-utils.js";

export class ReferenceValueBuilder {
    private readonly referenceValue: Writable<ReferenceValue> = {
        value: undefined,
        type: "Reference",
        status: Status.Available,
        validation: undefined,
        readOnly: false,
        setValidator: jest.fn(),
        setValue: jest.fn(value => this.withValue(value))
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
        return this.referenceValue;
    }
}
