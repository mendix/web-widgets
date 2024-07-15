import {
    String_InputFilterInterface,
    Number_InputFilterInterface,
    Date_InputFilterInterface
} from "./typings/InputFilterInterface";
import { action, computed, makeObservable, observable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { ListAttributeValue } from "mendix";

import {
    attribute,
    literal,
    equals,
    or,
    and,
    contains,
    startsWith,
    endsWith,
    greaterThan,
    greaterThanOrEqual,
    notEqual,
    lessThan,
    lessThanOrEqual
} from "mendix/filters/builders";
import { Big } from "big.js";
import { Argument, DateArgument, NumberArgument, StringArgument } from "./Argument";
import {
    AllFunctions,
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "./typings/FilterFunctions";

class BaseInputFilterStore<A extends Argument, Fn extends AllFunctions, V extends string | Big | Date> {
    filterFunction: Fn;
    arg1: A;
    arg2: A;
    isInitialized = false;
    protected _attributes: ListAttributeValue[] = [];
    private defaultState: [Fn] | [Fn, V] | [Fn, V, V];

    constructor(arg1: A, arg2: A, initFn: Fn, attributes: ListAttributeValue[]) {
        this._attributes = attributes;
        this.defaultState = [initFn];
        this.filterFunction = initFn;

        this.arg1 = arg1;
        this.arg2 = arg2;

        makeObservable<this, "_attributes" | "setState">(this, {
            _attributes: observable,
            filterFunction: observable,
            filterCondition: computed,
            setState: action,
            UNSAFE_setDefaults: action
        });
    }

    get filterCondition(): FilterCondition {
        const conditions = this._attributes
            .map(attr => getFilterCondition(attr, this.arg1.value, this.arg2.value, this.filterFunction))
            .filter((filter): filter is FilterCondition => filter !== undefined);

        return conditions?.length > 1 ? or(...conditions) : conditions?.[0];
    }

    initialize(state: [Fn] | [Fn, V] | [Fn, V, V]): void {
        this.setState(state);
        this.isInitialized = true;
    }

    private setState(state: [Fn] | [Fn, V] | [Fn, V, V]): void {
        [this.filterFunction, this.arg1.value, this.arg2.value] = state;
    }

    UNSAFE_setDefaults(state: [Fn] | [Fn, V] | [Fn, V, V]): void {
        this.defaultState = state;
        if (this.isInitialized === false) {
            this.setState(state);
        }
    }

    reset(): void {
        this.setState(this.defaultState);
    }

    /** Clear arguments, but keep current filter function. */
    clear(): void {
        this.setState([this.filterFunction]);
    }
}

function getFilterCondition<T extends string | Big | Date>(
    listAttribute: ListAttributeValue,
    value: T | undefined,
    valueR: T | undefined,
    operation: AllFunctions
): FilterCondition | undefined {
    if (
        !listAttribute ||
        !listAttribute.filterable ||
        (operation !== "empty" && operation !== "notEmpty" && !value) ||
        (operation === "between" && (!value || !valueR))
    ) {
        return undefined;
    }

    if (operation === "between") {
        return and(
            greaterThan(attribute(listAttribute.id), literal(value)),
            lessThan(attribute(listAttribute.id), literal(valueR))
        );
    }

    const filters = {
        contains,
        startsWith,
        endsWith,
        greater: greaterThan,
        greaterEqual: greaterThanOrEqual,
        equal: equals,
        notEqual,
        smaller: lessThan,
        smallerEqual: lessThanOrEqual,
        empty: equals,
        notEmpty: notEqual
    };

    return filters[operation](
        attribute(listAttribute.id),
        literal(operation === "empty" || operation === "notEmpty" ? undefined : value)
    );
}

export class StringInputFilterStore
    extends BaseInputFilterStore<
        StringArgument,
        FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        string
    >
    implements String_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "string";

    constructor(attributes: Array<ListAttributeValue<string>>) {
        const { formatter } = attributes[0];
        super(new StringArgument(formatter), new StringArgument(formatter), "equal", attributes);
        makeObservable(this, {
            updateProps: action
        });
        // todo restore operation and value from config
    }

    updateProps(attributes: ListAttributeValue[]): void {
        this._attributes = attributes;
        const formatter = attributes.at(0)?.formatter;
        // Just pleasing TypeScript.
        if (!formatter || formatter.type === "number" || formatter.type === "datetime") {
            console.error("InputFilterStore: encounter invalid attribute type while updating props.");
            return;
        }
        this.arg1.updateProps(formatter as ListAttributeValue<string>["formatter"]);
        this.arg2.updateProps(formatter as ListAttributeValue<string>["formatter"]);
    }
}

export class NumberInputFilterStore
    extends BaseInputFilterStore<
        NumberArgument,
        FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        Big
    >
    implements Number_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "number";

    constructor(attributes: Array<ListAttributeValue<Big>>) {
        const { formatter } = attributes[0];
        super(new NumberArgument(formatter), new NumberArgument(formatter), "equal", attributes);
        makeObservable(this, {
            updateProps: action
        });
        // todo restore operation and value from config
    }

    updateProps(attributes: ListAttributeValue[]): void {
        this._attributes = attributes;
        const formatter = attributes.at(0)?.formatter;
        // Just pleasing TypeScript.
        if (formatter?.type !== "number") {
            console.error("InputFilterStore: encounter invalid attribute type while updating props.");
            return;
        }
        this.arg1.updateProps(formatter);
        this.arg2.updateProps(formatter);
    }
}

export class DateInputFilterStore
    extends BaseInputFilterStore<
        DateArgument,
        FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        Date
    >
    implements Date_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "date";

    constructor(attributes: Array<ListAttributeValue<Date>>) {
        const { formatter } = attributes[0];
        super(new DateArgument(formatter), new DateArgument(formatter), "equal", attributes);
        makeObservable(this, {
            updateProps: action
        });
        // todo restore operation and value from config
    }

    updateProps(attributes: ListAttributeValue[]): void {
        this._attributes = attributes;
        const formatter = attributes.at(0)?.formatter;
        // Just pleasing TypeScript.
        if (formatter?.type !== "datetime") {
            console.error("InputFilterStore: encounter invalid attribute type while updating props.");
            return;
        }
        this.arg1.updateProps(formatter);
        this.arg2.updateProps(formatter);
    }
}

export type InputFilterStore = StringInputFilterStore | NumberInputFilterStore | DateInputFilterStore;
