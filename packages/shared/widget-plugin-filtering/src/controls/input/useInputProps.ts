import { Big } from "big.js";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { InputHookProps, InputProps } from "./typings";
import { EditableFilterStore } from "./EditableFilterStore";
import { AllFunctions } from "../../typings/FilterFunctions";
import { InputStore } from "./InputStore";

export function useInputProps<V extends string | Big | Date>(
    props: InputHookProps<AllFunctions, V>
): InputProps<AllFunctions> {
    const inputRef = useRef<HTMLInputElement>(null);
    const { current: defaultValue } = useRef(props.defaultValue);
    const [store] = useState(() => new EditableFilterStore({ filter: props.filterStore }));
    const inputStores = useMemo<[InputStore, InputStore]>(() => [store.input1, store.input2], [store]);
    const onFilterChange = useCallback(
        (fn: AllFunctions, isFromUserInteraction: boolean) => {
            store.filterFunction = fn;

            if (isFromUserInteraction) {
                inputRef.current?.focus();
            }
        },
        [store]
    );

    useEffect(() => {
        const disposer = store.setup();
        // This method should be called only once.
        store.UNSAFE_setDefaults([props.defaultFilter, defaultValue]);
        return disposer;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store]);

    return {
        filterFn: store.filterFunction,
        filterFnList: props.filters,
        inputRef,
        disableInputs: props.disableInputs?.(store.filterFunction),
        inputStores,
        onFilterChange
    };
}
