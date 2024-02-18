/* eslint-disable react-hooks/exhaustive-deps */
import { useValueFilter } from "@mendix/widget-plugin-filtering";
import { useFilterResetEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useCallback, useRef, useEffect } from "react";
import { FilterComponentProps, FilterInputProps } from "../components/typings";
import * as ValueUtils from "../utils/value";

export function useFilter(props: FilterComponentProps): FilterInputProps {
    const inputRef = useRef<HTMLInputElement>(null);

    const [state, { setFilterFn, setInputValue, reset, dangerous_setValueAndDoNotDispatch }] = useValueFilter({
        defaultValue: props.value,
        defaultFilterFn: props.defaultFilterType,
        dispatchOnMounted: props.value !== undefined,
        delay: props.inputChangeDelay,
        mapValue: ValueUtils.toBig,
        valueEquals: ValueUtils.equals,
        valueToString: ValueUtils.toString,
        onFilterChange: props.updateFilters
    });

    useEffect(() => {
        dangerous_setValueAndDoNotDispatch(props.value);
    }, [props.value]);

    useFilterResetEvent({
        widgetName: props.name,
        parentChannelName: props.datagridChannelName,
        listener: reset
    });

    return {
        ...props,
        inputRef,
        inputValue: state.inputValue,
        inputDisabled: state.filterFn === "empty" || state.filterFn === "notEmpty",
        onFilterTypeClick: useCallback(fn => {
            setFilterFn(fn);
            inputRef.current?.focus();
        }, []),
        onInputChange: useCallback(event => setInputValue(event.target.value), [])
    };
}
