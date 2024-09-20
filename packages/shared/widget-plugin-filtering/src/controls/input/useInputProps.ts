/* eslint-disable react-hooks/exhaustive-deps */
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { SetFilterValueArgs } from "@mendix/widget-plugin-external-events/typings";
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

    useOnSetValueEvent({
        widgetName: props.name,
        listener: (useDefaultValue: boolean, valueOptions: SetFilterValueArgs) => {
            if (useDefaultValue) {
                reset([useDefaultValue]);
            } else {
                const value =
                    props.inputType === "number" ? valueOptions.numberValue.toString() : valueOptions.stringValue;
                setInputValue(value);
                setFilterFn(valueOptions.operators as TFilterEnum);
            }
        }
    });

    return {
        defaultFilter: state.filterFn,
        filters: props.filters,
        inputType: props.inputType,
        inputRef,
        inputValue: state.inputValue,
        inputDisabled: inputDisabled(state.filterFn),
        onFilterChange: useCallback((fn, isFromUserInteraction) => {
            setFilterFn(fn);
            if (isFromUserInteraction) {
                inputRef.current?.focus();
            }
        }, []),
        onInputChange: useCallback(event => setInputValue(event.target.value), [])
    };
}
