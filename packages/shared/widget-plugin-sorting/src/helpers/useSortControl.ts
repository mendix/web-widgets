import { useMemo, useCallback } from "react";
import { Option, SortDirection, SortingStoreInterface } from "../typings";

interface HookProps {
    emptyOptionCaption?: string;
}

interface ControlProps {
    value: string | null;
    options: Option[];
    direction: SortDirection;
    onSelect: (option: Option) => void;
    onDirectionClick: () => void;
}

export function useSortControl(props: HookProps, store: SortingStoreInterface): ControlProps {
    const options = useMemo(() => {
        return [{ caption: props.emptyOptionCaption ?? "", value: null } as Option, ...store.options];
    }, [store.options, props.emptyOptionCaption]);

    return {
        value: store.value,
        options,
        direction: store.direction,
        onSelect: useCallback(
            option => {
                store.select(option.value);
            },
            [store]
        ),
        onDirectionClick: store.toggleDirection
    };
}
