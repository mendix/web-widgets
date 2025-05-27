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
import { AllFunctions } from "../../typings/FilterFunctions";
import { FilterData, InputData } from "../../typings/settings";
import { Argument } from "./Argument";

type StateTuple<Fn, V> = [Fn] | [Fn, V] | [Fn, V, V];
type Val<A extends Argument> = A["value"];
export class BaseInputFilterStore<A extends Argument, Fn extends AllFunctions> {
    protected _attributes: ListAttributeValue[] = [];
    private _filterFunction: Fn;
    private _isFilterFunctionAdjustable: boolean = true;
    arg1: A;
    arg2: A;
    isInitialized = false;
    defaultState: StateTuple<Fn, Val<A>>;

    constructor(arg1: A, arg2: A, initFn: Fn, attributes: ListAttributeValue[]) {
        this._attributes = attributes;
        this.defaultState = [initFn];
        this._filterFunction = initFn;

        this.arg1 = arg1;
        this.arg2 = arg2;

        makeObservable<this, "_attributes" | "setState" | "_filterFunction" | "_isFilterFunctionAdjustable">(this, {
            _attributes: observable.ref,
            _filterFunction: observable,
            _isFilterFunctionAdjustable: observable,
            isInitialized: observable,
            condition: computed,
            setState: action,
            UNSAFE_setDefaults: action,
            UNSAFE_overwriteFilterFunction: action,
            filterFunction: computed
        });
    }
    get filterFunction(): Fn {
        return this._filterFunction;
    }

    set filterFunction(fn: Fn) {
        if (this._isFilterFunctionAdjustable) {
            this._filterFunction = fn;
        }
    }

    UNSAFE_overwriteFilterFunction(fn: Fn): void {
        // in case of filtering set from js actions, it should be possible to
        // change this property even though the filterFunction is not adjustable.
        this._filterFunction = fn;
    }

    protected setState(state: StateTuple<Fn, Val<A>>): void {
        [this.filterFunction, this.arg1.value, this.arg2.value] = state;
    }

    get condition(): FilterCondition | undefined {
        const conditions = this._attributes
            .map(attr => getFilterCondition(attr, this.arg1.value, this.arg2.value, this.filterFunction))
            .filter((filter): filter is FilterCondition => filter !== undefined);

        return conditions?.length > 1 ? or(...conditions) : conditions?.[0];
    }

    UNSAFE_setDefaults = (state: StateTuple<Fn, Val<A>>, canAdjustFilterFunction: boolean): void => {
        this.defaultState = state;
        if (!canAdjustFilterFunction) {
            // filter function is not adjustable, reset to default and lock it
            this.filterFunction = this.defaultState[0];
            this._isFilterFunctionAdjustable = false;
        }
        if (!this.isInitialized) {
            this.setState(state);
            this.isInitialized = true;
        }
    };

    reset = (): void => {
        [this._filterFunction, this.arg1.value, this.arg2.value] = this.defaultState;
    };

    /** Clear arguments, but keep current filter function. */
    clear = (): void => {
        this.setState([this.filterFunction]);
    };

    protected unpackJsonData(data: FilterData): InputData<Fn> | undefined {
        if (!Array.isArray(data)) {
            return undefined;
        }

        if (data.length !== 3) {
            return undefined;
        }

        return data as InputData<Fn>;
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
