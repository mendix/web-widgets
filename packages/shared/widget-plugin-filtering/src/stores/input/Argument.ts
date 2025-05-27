import { Big } from "big.js";
import { EditableValue } from "mendix";
import { computed, makeObservable, observable } from "mobx";
import {
    DateArgumentInterface,
    NumberArgumentInterface,
    StringArgumentInterface
} from "../../typings/ArgumentInterface";

type Formatter<T extends Big | Date | string> = EditableValue<T>["formatter"];

export class ArgumentBase<T extends Big | Date | string> {
    private _value: T | undefined;
    isValid = true;

    _formatter: Formatter<T>;
    _lastSetTextValue = "";

    constructor(formatter: Formatter<T>, initialValue?: T) {
        this._formatter = formatter;
        this._value = initialValue;

        makeObservable<this, "_value">(this, {
            _value: observable,
            value: computed,
            isValid: observable,
            _lastSetTextValue: observable,

            displayValue: computed,

            _formatter: observable.ref
        });
    }

    updateProps(formatter: Formatter<T>): void {
        this._formatter = formatter;
    }

    set value(v: T | undefined) {
        this._value = v;
        this._lastSetTextValue = "";
        this.isValid = true;
    }

    get value(): T | undefined {
        return this._value;
    }

    get displayValue(): string {
        if (this.isValid) {
            return this._formatter?.format(this.value) || this.value?.toString() || "";
        } else {
            return this._lastSetTextValue;
        }
    }

    set displayValue(textValue: string) {
        this._lastSetTextValue = textValue;
        const parseResult = this._formatter?.parse(this._lastSetTextValue);
        this.isValid = parseResult.valid;
        if (parseResult.valid && !this.equals(this._value, parseResult.value)) {
            this._value = parseResult.value;
        }
    }

    equals(_: T | undefined, __: T | undefined): boolean {
        throw new Error("equals not implemented");
    }
}

export class NumberArgument extends ArgumentBase<Big> implements NumberArgumentInterface {
    readonly type = "number";
    equals(a: Big | undefined, b: Big | undefined): boolean {
        return Object.is(a, b) || !!(a && b && a.eq(b));
    }
}

export class DateArgument extends ArgumentBase<Date> implements DateArgumentInterface {
    readonly type = "date";
    equals(a: Date | undefined, b: Date | undefined): boolean {
        return Object.is(a, b) || !!(a && b && +a === +b);
    }
}

export class StringArgument extends ArgumentBase<string> implements StringArgumentInterface {
    readonly type = "string";
    equals(a: string | undefined, b: string | undefined): boolean {
        return a === b;
    }
}

export type Argument = NumberArgument | DateArgument | StringArgument;
