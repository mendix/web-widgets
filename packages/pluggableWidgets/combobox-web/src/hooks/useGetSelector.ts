import { useRef } from "react";
import { getSelector } from "../helpers/getSelector";
import { Selector } from "../helpers/types";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function useGetSelector(props: ComboboxContainerProps): Selector<string | string[]> {
    const selectorRef = useRef<Selector<string | string[]> | undefined>(undefined);
    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
    }
    selectorRef.current.updateProps(props);
    return selectorRef.current;
}
