import type { EditableValue } from "mendix";
import type { Big } from "big.js";
import { Status } from "../constants.js";

type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};
/* eslint-disable no-unused-vars */
export enum FormatterType {
    Number = "number",
    DateTime = "datetime"
}
/* eslint-enable no-unused-vars */

export class EditableValueBuilder<T extends string | boolean | Date | Big> {
    private readonly editableValue: Writable<EditableValue<T>> = {
        value: undefined,
        displayValue: "",
        status: Status.Available,
        validation: undefined,
        readOnly: false,
        formatter: {
            format: jest.fn(name => `Formatted ${name}`),
            parse: jest.fn(),
            withConfig: jest.fn(() => new EditableValueBuilder().build().formatter) as any,
            getFormatPlaceholder: jest.fn(),
            type: FormatterType.DateTime as any,
            config: {} as any
        },
        setValidator: jest.fn(),
        setValue: jest.fn((value: T) => this.withValue(value)),
        setTextValue: jest.fn(),
        setFormatter: jest.fn()
    };

    withValue(value?: T): EditableValueBuilder<T> {
        this.editableValue.value = value;
        this.editableValue.displayValue = this.editableValue.formatter.format(value);
        return this;
    }

    withFormatter(formatter: EditableValue<T>["formatter"]): EditableValueBuilder<T> {
        this.editableValue.formatter = formatter;
        return this;
    }

    isReadOnly(): EditableValueBuilder<T> {
        this.editableValue.readOnly = true;
        return this;
    }

    isLoading(): EditableValueBuilder<T> {
        this.editableValue.status = Status.Loading;
        return this.isReadOnly();
    }

    isUnavailable(): EditableValueBuilder<T> {
        this.editableValue.status = Status.Unavailable;
        return this.isReadOnly();
    }

    withValidation(validation?: string): EditableValueBuilder<T> {
        this.editableValue.validation = validation;
        return this;
    }

    withUniverse(...values: T[]): EditableValueBuilder<T> {
        this.editableValue.universe = values;
        return this;
    }

    build(): EditableValue<T> {
        return this.editableValue;
    }
}
