/* eslint-disable react-hooks/exhaustive-deps */
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { useState, useMemo, useEffect } from "react";
import { FilterCondition } from "mendix/filters";
import { ValueHelper } from "./typings";

type FilterFunction = FilterCondition["name"];

type Optional<T> = T | undefined;

type State<TFilterEnum> = {
    /** Filter function (type) name (e.g >, >=, starts-with, etc). */
    filterFn: TFilterEnum;
    /** HTMLInput value. */
    inputValue: string;
};

type Actions<TValue, TFilterEnum> = {
    setInputValue: (arg: string) => void;
    setFilterFn: (arg: TFilterEnum) => void;
    dangerous_setValueAndDoNotDispatch: (arg: Optional<TValue>) => void;
    reset: (...args: any[]) => void;
};

type FilterListener<TValue, TFilterEnum> = (value: TValue, filterFn: TFilterEnum) => void;

type StateListener<TFilterEnum> = (state: State<TFilterEnum>) => void;

type Params<TValue, TFilterEnum> = {
    /** Default filter function. */
    defaultFilter: TFilterEnum;
    /** Default filter value. */
    defaultValue: TValue;
    /** Helper to compare and convert value. */
    valueHelper: ValueHelper<Optional<TValue>>;
    /** Listener for filter value changes. */
    onFilterChange: FilterListener<Optional<TValue>, TFilterEnum>;
    /** If true, onFilterChange will be called once when mounted. */
    dispatchOnMounted: boolean;
    /** Filter change delay in milliseconds. */
    delay?: number;
};

/** A self-contained value store that can (but not require) be  synchronized with `value` from props. */
class ValueFilterStore<TValue, TFilterEnum = FilterFunction> {
    clearTimers: () => void;
    valueHelper: ValueHelper<Optional<TValue>>;
    private filterListener: FilterListener<Optional<TValue>, TFilterEnum> | undefined;
    private stateListener: StateListener<TFilterEnum> | undefined;
    private _value: Optional<TValue>;
    private _defaultValue: Optional<TValue>;
    state: State<TFilterEnum>;
    dispatchOnMounted: boolean;

    constructor(params: Params<Optional<TValue>, TFilterEnum>) {
        this._defaultValue = params.defaultValue;
        this._value = params.defaultValue;
        this.filterListener = params.onFilterChange;
        this.dispatchOnMounted = params.dispatchOnMounted;
        this.valueHelper = params.valueHelper;

        this.state = {
            inputValue: this.valueHelper.toString(params.defaultValue),
            filterFn: params.defaultFilter
        };
        [this.onInputChange, this.clearTimers] = debounce(this.onInputChange.bind(this), params.delay ?? 500);
    }

    addStateChangeListener(fn: StateListener<TFilterEnum>): void {
        this.stateListener = fn;
    }

    dispose(): void {
        this.clearTimers();
        this.stateListener = undefined;
        this.filterListener = undefined;
    }

    /** Returns true if the prop has been changed. */
    set<K extends keyof State<TFilterEnum>>(prop: K, value: State<TFilterEnum>[K]): boolean {
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

    setFilterFn(arg: TFilterEnum): void {
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
    dangerous_setValueAndDoNotDispatch(newValue: Optional<TValue>): boolean {
        if (this.valueHelper.equals(this._value, newValue)) {
            return false;
        }
        this._value = newValue;
        this.set("inputValue", this.valueHelper.toString(newValue));
        return true;
    }

    reset(...args: any[]): void {
        const [setDefault] = args;
        if (this.dangerous_setValueAndDoNotDispatch(setDefault ? this._defaultValue : undefined)) {
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
    private dispatchState(state: State<TFilterEnum>): void {
        this.stateListener?.(state);
    }

    /** Dispatch value update. */
    private dispatchValue(): void {
        this.filterListener?.(this._value, this.state.filterFn);
    }

    private onInputChange(): void {
        const newValue = this.valueHelper.fromString(this.state.inputValue);
        if (this.valueHelper.equals(this._value, newValue)) {
            return;
        }
        this._value = newValue;
        this.dispatchValue();
    }

    private onFilterChange(): void {
        this.dispatchValue();
    }
}

export function useValueFilterState<TValue, TFilterEnum>(
    params: Params<TValue, TFilterEnum>
): [State<TFilterEnum>, Actions<TValue, TFilterEnum>] {
    const onFilterChange = useEventCallback(params.onFilterChange);

    const store = useMemo(() => new ValueFilterStore({ ...params, onFilterChange }), []);

    const [state, setState] = useState(() => {
        store.addStateChangeListener(s => setState(s));
        return store.state;
    });

    const actions = useMemo<Actions<TValue, TFilterEnum>>(
        () => ({
            setInputValue: arg => store.setInputValue(arg),
            setFilterFn: arg => {
                store.setFilterFn(arg);
            },
            dangerous_setValueAndDoNotDispatch: arg => store.dangerous_setValueAndDoNotDispatch(arg),
            reset: args => store.reset(args)
        }),
        []
    );

    useEffect(() => store.setupEffect(), []);

    return [state, actions];
}
