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
    /** HTMLInput value. */
    inputValue: string;
};

type Actions<TValue, TFnEnum> = {
    setInputValue: (arg: string) => void;
    setFilterFn: (arg: TFnEnum) => void;
    dangerous_setValueAndDoNotDispatch: (arg: Option<TValue>) => void;
    reset: () => void;
};

type EqualsFn<T> = (a: T, b: T) => boolean;

type MapValueFn<T> = (arg: string) => T;

type ValueToString<T> = (arg: T) => string;

type FilterListener<TValue, TFnEnum> = (value: TValue, filterFn: TFnEnum) => void;

type StateListener<TFnEnum> = (state: State<TFnEnum>) => void;

type Params<TValue, TFnEnum> = {
    /** Default filter function. */
    defaultFilterFn: TFnEnum;
    /** Default filter value. */
    defaultValue: TValue;
    /** Function to map input value. */
    mapValue: MapValueFn<Option<TValue>>;
    /** Function to compare the previous value and the new value. */
    valueEquals: EqualsFn<Option<TValue>>;
    /** Function to map value to string. */
    valueToString: ValueToString<Option<TValue>>;
    /** Listener for filter value changes. */
    onFilterChange?: FilterListener<Option<TValue>, TFnEnum>;
    /** If true, onFilterChange will be called once when mounted. */
    dispatchOnMounted: boolean;
    /** Filter change delay in milliseconds. */
    delay?: number;
};

/** A self-contained value store that can (but not require) be  synchronized with `value` from props. */
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

    /** Returns true if the prop has been changed. */
    set<K extends keyof State<TFnEnum>>(prop: K, value: State<TFnEnum>[K]): boolean {
        if (this.state[prop] === value) {
            return false;
        }
        this.state[prop] = value;
        this.dispatchState({ ...this.state });
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
     * Set value without dispatching value update. Returns true if value is changed.
     * @remarks
     * As we are planning to implement filter value "saving" with settings for the data grid we need a way to sync
     * props.value with this store. This is the method you can use to "sync" value into the store.
     * Please be responsible: only use it if you know what you're doing - most of the time you won't need it.
     */
    dangerous_setValueAndDoNotDispatch(newValue: Option<TValue>): boolean {
        if (this.valueEquals(this._value, newValue)) {
            return false;
        }
        this._value = newValue;
        this.set("inputValue", this.valueToString(newValue));
        return true;
    }

    reset(): void {
        if (this.dangerous_setValueAndDoNotDispatch(undefined)) {
            this.dispatchValue();
        }
    }

    setupEffect(): () => void {
        if (this.dispatchOnMounted) {
            this.dispatchValue();
        }
        return () => this.dispose();
    }

    /** Dispatch state update. */
    private dispatchState(state: State<TFnEnum>): void {
        this.stateListener?.(state);
    }

    /** Dispatch value update. */
    private dispatchValue(): void {
        this.filterListener?.(this._value, this.state.filterFn);
    }

    private onInputChange(): void {
        const newValue = this.mapValue(this.state.inputValue);
        if (this.valueEquals(this._value, newValue)) {
            return;
        }
        this._value = newValue;
        this.dispatchValue();
    }

    private onFilterChange(): void {
        this.dispatchValue();
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
            dangerous_setValueAndDoNotDispatch: arg => store.dangerous_setValueAndDoNotDispatch(arg),
            reset: () => store.reset()
        }),
        []
    );

    useEffect(() => store.setupEffect(), []);

    return [state, actions];
}
