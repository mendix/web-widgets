import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { useMemo, useRef, useState } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { getSelector } from "../helpers/getSelector";
import { Selector } from "../helpers/types";

function onInputValueChange(
    onChangeFilterInputEvent: ComboboxContainerProps["onChangeFilterInputEvent"],
    filterValue?: string
): void {
    if (!onChangeFilterInputEvent) {
        return;
    }
    if (onChangeFilterInputEvent.canExecute && !onChangeFilterInputEvent.isExecuting) {
        onChangeFilterInputEvent.execute({
            filterInput: filterValue
        });
    }
}

export function useGetSelector(props: ComboboxContainerProps): Selector {
    const selectorRef = useRef<Selector | undefined>(undefined);
    const [, setInput] = useState({});
    const [onFilterChangeDebounce] = useMemo(
        () =>
            debounce((filterValue?: string) => {
                onInputValueChange(props.onChangeFilterInputEvent, filterValue);
            }, props.filterInputDebounceInterval ?? 200),
        [props.onChangeFilterInputEvent, props.filterInputDebounceInterval]
    );

    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
        selectorRef.current.options.onAfterSearchTermChange(() => setInput({}));
    } else {
        if (!selectorRef.current.onFilterInputChange) {
            selectorRef.current.onFilterInputChange = onFilterChangeDebounce;
        }
    }
    selectorRef.current.updateProps(props);

    return selectorRef.current;
}
