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
    arg1: A;
    arg2: A;
    isInitialized = false;
    adjustableFilterFunction: boolean = true;
    defaultState: StateTuple<Fn, Val<A>>;

    constructor(arg1: A, arg2: A, initFn: Fn, attributes: ListAttributeValue[]) {
        this._attributes = attributes;
        this.defaultState = [initFn];
        this._filterFunction = initFn;

        this.arg1 = arg1;
        this.arg2 = arg2;

        makeObservable<this, "_attributes" | "setState" | "_filterFunction">(this, {
            _attributes: observable.ref,
            _filterFunction: observable,
            isInitialized: observable,
            adjustableFilterFunction: observable,
            condition: computed,
            setState: action,
            UNSAFE_setDefaults: action,
            setFilterFn: action
        });
    }
    get filterFunction(): Fn {
        return this._filterFunction;
    }

    protected setState(state: StateTuple<Fn, Val<A>>): void {
        if (this.adjustableFilterFunction) {
            [this._filterFunction, this.arg1.value, this.arg2.value] = state;
        } else {
            [, this.arg1.value, this.arg2.value] = state;
        }
    }

    get condition(): FilterCondition | undefined {
        const conditions = this._attributes
            .map(attr => getFilterCondition(attr, this.arg1.value, this.arg2.value, this.filterFunction))
            .filter((filter): filter is FilterCondition => filter !== undefined);

        return conditions?.length > 1 ? or(...conditions) : conditions?.[0];
    }

    UNSAFE_setDefaults = (state: StateTuple<Fn, Val<A>>, adjustableFilter: boolean): void => {
        this.defaultState = state;
        this.adjustableFilterFunction = adjustableFilter;
        if (!this.adjustableFilterFunction) {
            // filter function is not adjustable, reset to default.
            this.setFilterFn(this.defaultState[0]);
        }
        if (!this.isInitialized) {
            this.setState(state);
            this.isInitialized = true;
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
        if (this.adjustableFilterFunction) {
            this._filterFunction = fn;
        }
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
