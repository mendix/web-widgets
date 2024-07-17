import { Big } from "big.js";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import {
    and,
    attribute,
    contains,
    endsWith,
    equals,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    literal,
    notEqual,
    or,
    startsWith
} from "mendix/filters/builders";
import { action, computed, makeObservable, observable } from "mobx";
import { Argument } from "./Argument";
import { AllFunctions } from "./typings/FilterFunctions";

export class BaseInputFilterStore<A extends Argument, Fn extends AllFunctions, V extends string | Big | Date> {
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
            _attributes: observable.ref,
            filterFunction: observable,
            filterCondition: computed,
            setState: action,
            UNSAFE_setDefaults: action,
            setFilterFn: action
        });
    }

    private setState(state: [Fn] | [Fn, V] | [Fn, V, V]): void {
        [this.filterFunction, this.arg1.value, this.arg2.value] = state;
    }

    get filterCondition(): FilterCondition | undefined {
        const conditions = this._attributes
            .map(attr => getFilterCondition(attr, this.arg1.value, this.arg2.value, this.filterFunction))
            .filter((filter): filter is FilterCondition => filter !== undefined);

        return conditions?.length > 1 ? or(...conditions) : conditions?.[0];
    }

    initialize = (state: [Fn] | [Fn, V] | [Fn, V, V]): void => {
        this.setState(state);
        this.isInitialized = true;
    };

    UNSAFE_setDefaults = (state: [Fn] | [Fn, V] | [Fn, V, V]): void => {
        this.defaultState = state;
        if (this.isInitialized === false) {
            this.initialize(state);
        }
    };

    reset = (): void => {
        this.setState(this.defaultState);
    };

    /** Clear arguments, but keep current filter function. */
    clear = (): void => {
        this.setState([this.filterFunction]);
    };

    setFilterFn = (fn: Fn): void => {
        this.filterFunction = fn;
    };
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
