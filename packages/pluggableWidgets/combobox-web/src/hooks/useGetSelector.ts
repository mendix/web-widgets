import { useCallback, useMemo, useRef } from "react";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { useObservableSnapshot } from "./useObservableSnapshot";
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
            filterInput: filterValue || undefined
        });
    }
}

export function useGetSelector(props: ComboboxContainerProps): Selector {
    const selectorRef = useRef<Selector | undefined>(undefined);
    const [onFilterChangeDebounce] = useMemo(
        () =>
            debounce((filterValue?: string) => {
                onInputValueChange(props.onChangeFilterInputEvent, filterValue);
            }, props.filterInputDebounceInterval ?? 200),
        [props.onChangeFilterInputEvent, props.filterInputDebounceInterval]
    );

    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
    } else {
        if (!selectorRef.current.onFilterInputChange) {
            selectorRef.current.onFilterInputChange = onFilterChangeDebounce;
        }
    }
    selectorRef.current.updateProps(props);

    // The search term is the only store state that changes outside a props update or a Mendix
    // value write, so it is the only observable the host subscribes to in migration step 1.
    const selector = selectorRef.current;
    useObservableSnapshot(useCallback(() => selector.options.searchTerm, [selector]));

    return selector;
}
