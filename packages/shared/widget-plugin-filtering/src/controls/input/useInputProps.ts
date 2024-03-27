/* eslint-disable react-hooks/exhaustive-deps */
import { useOnResetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useCallback, useRef, useEffect } from "react";
import { useValueFilterState } from "./useValueFilterState";
import { InputHookProps, InputProps } from "./typings";

export function useInputProps<TValue, TFilterEnum>(
    props: InputHookProps<TValue, TFilterEnum>
): InputProps<TFilterEnum> {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputDisabled = props.inputDisabled ?? (() => false);

    const [state, { setFilterFn, setInputValue, reset, dangerous_setValueAndDoNotDispatch }] = useValueFilterState({
        onFilterChange: props.onChange,
        defaultValue: props.value,
        defaultFilter: props.defaultFilter,
        dispatchOnMounted: props.value !== undefined,
        delay: props.changeDelay,
        valueHelper: props.valueHelper
    });

    useEffect(() => {
        dangerous_setValueAndDoNotDispatch(props.value);
    }, [props.value]);

    useOnResetValueEvent({
        widgetName: props.name,
        parentChannelName: props.parentChannelName ?? undefined,
        listener: reset
    });

    return {
        defaultFilter: props.defaultFilter,
        filters: props.filters,
        inputType: props.inputType,
        inputRef,
        inputValue: state.inputValue,
        inputDisabled: inputDisabled(state.filterFn),
        onFilterChange: useCallback(fn => {
            setFilterFn(fn);
            inputRef.current?.focus();
        }, []),
        onInputChange: useCallback(event => setInputValue(event.target.value), [])
    };
}
