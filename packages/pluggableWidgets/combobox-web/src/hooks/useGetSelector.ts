import { useRef, useState, useCallback } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { getSelector } from "../helpers/getSelector";
import { Selector } from "../helpers/types";

export function useGetSelector(props: ComboboxContainerProps): Selector {
    const selectorRef = useRef<Selector | undefined>(undefined);
    const [, setInput] = useState({});
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();
    const lastExecutedValueRef = useRef<string>("");

    const onFilterInputChange = useCallback(
        (filterValue: string) => {
            if (!props.onChangeFilterInputEvent) {
                return;
            }

            if (lastExecutedValueRef.current === filterValue) {
                return;
            }

            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                lastExecutedValueRef.current = filterValue;
                try {
                    if (props.onChangeFilterInputEvent?.canExecute && !props.onChangeFilterInputEvent?.isExecuting) {
                        props.onChangeFilterInputEvent.execute({
                            filterInput: filterValue
                        });
                    }
                } catch (error) {
                    console.error("Error executing onChangeFilterInputEvent:", error);
                }
            }, 300);
        },
        [props.onChangeFilterInputEvent]
    );

    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
        selectorRef.current.options.onAfterSearchTermChange(() => setInput({}));
    }
    selectorRef.current.updateProps(props);
    selectorRef.current.onFilterInputChange = onFilterInputChange;

    return selectorRef.current;
}
