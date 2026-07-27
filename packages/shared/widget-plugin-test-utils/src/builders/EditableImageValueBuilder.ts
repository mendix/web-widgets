import type { EditableImageValue, ImageValue } from "mendix";
import { Status } from "../constants.js";
import { Writable } from "./type-utils.js";

export class EditableImageValueBuilder<T extends ImageValue> {
    private readonly editableImageValue: Writable<EditableImageValue<T>> = {
        value: undefined,
        status: Status.Available,
        readOnly: false,
        validation: undefined,
        setValidator: jest.fn(),
        setValue: jest.fn((value?: T) => this.withValue(value)),
        setThumbnailSize: jest.fn()
    };

    withValue(value?: T): EditableImageValueBuilder<T> {
        this.editableImageValue.value = value;
        return this;
    }

    isReadOnly(): EditableImageValueBuilder<T> {
        this.editableImageValue.readOnly = true;
        return this;
    }

    isLoading(): EditableImageValueBuilder<T> {
        this.editableImageValue.status = Status.Loading;
        return this.isReadOnly();
    }

    isUnavailable(): EditableImageValueBuilder<T> {
        this.editableImageValue.status = Status.Unavailable;
        return this.isReadOnly();
    }

    withValidation(validation?: string): EditableImageValueBuilder<T> {
        this.editableImageValue.validation = validation;
        return this;
    }

    build(): EditableImageValue<T> {
        return this.editableImageValue;
    }
}
