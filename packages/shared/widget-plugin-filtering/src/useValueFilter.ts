/* eslint-disable react-hooks/exhaustive-deps */
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { useState, useMemo, useEffect } from "react";
import { FilterCondition } from "mendix/filters";

type FilterFunction = FilterCondition["name"];

type Option<T> = T | undefined;

type State<TFnEnum> = {
    /** Filter function (type) name (e.g >, >=, starts-with, etc). */
    filterFn: TFnEnum;
    /** HTMLInput value */
    inputValue: string;
};

type Actions<TValue, TFnEnum> = {
    setInputValue: (arg: string) => void;
    setFilterFn: (arg: TFnEnum) => void;
    setValue: (arg: Option<TValue>) => void;
    reset: () => void;
};

type EqualsFn<T> = (a: T, b: T) => boolean;

type MapValueFn<T> = (arg: string) => T;

type ValueToString<T> = (arg: T) => string;

type FilterListener<TValue, TFnEnum> = (value: TValue, filterFn: TFnEnum) => void;

type StateListener<TFnEnum> = (state: State<TFnEnum>) => void;

type Params<TValue, TFnEnum> = {
    /** Default filter function. Used only during first render. */
    defaultFilterFn: TFnEnum;
    /** Default filter value. Used only during first render.  */
    defaultValue: TValue;
    /** Function to map input value. */
    mapValue: MapValueFn<Option<TValue>>;
    /** Function to compare prev value and new value. */
    valueEquals: EqualsFn<Option<TValue>>;
    /** Function to map value to string. */
    valueToString: ValueToString<Option<TValue>>;
    /** Filter change listener. */
    onFilterChange?: FilterListener<Option<TValue>, TFnEnum>;
    /** If true, onFilterChange will be called once at first mount. */
    dispatchOnMounted: boolean;
    /** Filter change delay in milliseconds. */
    delay?: number;
};

class ValueFilterStore<TValue, TFnEnum = FilterFunction> {
    clearTimers: () => void;
    mapValue: MapValueFn<Option<TValue>>;
    valueEquals: EqualsFn<Option<TValue>>;
    valueToString: ValueToString<Option<TValue>>;
    private filterListener: FilterListener<Option<TValue>, TFnEnum> | undefined;
    private stateListener: StateListener<TFnEnum> | undefined;
    private _value: Option<TValue>;
    state: State<TFnEnum>;
    dispatchOnMounted: boolean;

    constructor(params: Params<Option<TValue>, TFnEnum>) {
        this._value = params.defaultValue;
        this.filterListener = params.onFilterChange;
        this.dispatchOnMounted = params.dispatchOnMounted;
        this.mapValue = params.mapValue;
        this.valueEquals = params.valueEquals;
        this.valueToString = params.valueToString;

        this.state = {
            inputValue: this.valueToString(params.defaultValue),
            filterFn: params.defaultFilterFn
        };
        [this.onInputChange, this.clearTimers] = debounce(this.onInputChange.bind(this), params.delay ?? 500);
    }

    addStateChangeListener(fn: StateListener<TFnEnum>): void {
        this.stateListener = fn;
    }

    dispose(): void {
        this.clearTimers();
        this.stateListener = undefined;
        this.filterListener = undefined;
    }

    /** Return true if prop is changed. */
    set<K extends keyof State<TFnEnum>>(prop: K, value: State<TFnEnum>[K]): boolean {
        if (this.state[prop] === value) {
            return false;
        }
        this.state[prop] = value;
        this.dispatchState(this.state);
        return true;
    }

    setInputValue(arg: string): void {
        if (this.set("inputValue", arg)) {
            this.onInputChange();
        }
    }

    setFilterFn(arg: TFnEnum): void {
        if (this.set("filterFn", arg)) {
            this.onFilterChange();
        }
    }

    /**
     * Sets value. Return true if value is changed.
     * @remarks
     * Please, use this method only in `this.reset` and `this.setFromProps`
     */
    setValue(newValue: Option<TValue>): boolean {
        if (this.valueEquals(this._value, newValue)) {
            return false;
        }
        this._value = newValue;
        this.set("inputValue", this.valueToString(newValue));
        return true;
    }

    reset(): void {
        if (this.setValue(undefined)) {
            this.dispatchValue(this._value, this.state.filterFn);
        }
    }

    setupEffect(): () => void {
        if (this.dispatchOnMounted) {
            this.dispatchValue(this._value, this.state.filterFn);
        }
        return () => this.dispose();
    }

    /** Dispatch state update. */
    private dispatchState(state: State<TFnEnum>): void {
        this.stateListener?.(state);
    }

    /**
     * Dispatch value update.
     * @remarks
     * Please don't use `this`, pass value as args to avoid "sync" loops.
     */
    private dispatchValue(value: Option<TValue>, filterFn: TFnEnum): void {
        this.filterListener?.(value, filterFn);
    }

    private onInputChange(): void {
        const newValue = this.mapValue(this.state.inputValue);
        if (this.valueEquals(this._value, newValue)) {
            return;
        }
        this.dispatchValue(newValue, this.state.filterFn);
    }

    private onFilterChange(): void {
        this.dispatchValue(this._value, this.state.filterFn);
    }
}

export function useValueFilter<TValue, TFnEnum>(
    params: Params<TValue, TFnEnum>
): [State<TFnEnum>, Actions<TValue, TFnEnum>] {
    const onFilterChange = useEventCallback(params.onFilterChange);

    const store = useMemo(() => new ValueFilterStore({ ...params, onFilterChange }), []);

    const [state, setState] = useState(() => {
        store.addStateChangeListener(s => setState(s));
        return store.state;
    });

    const actions = useMemo<Actions<TValue, TFnEnum>>(
        () => ({
            setInputValue: arg => store.setInputValue(arg),
            setFilterFn: arg => store.setFilterFn(arg),
            setValue: arg => store.setValue(arg),
            reset: () => store.reset()
        }),
        []
    );

    useEffect(store.setupEffect, []);

    return [state, actions];
}
