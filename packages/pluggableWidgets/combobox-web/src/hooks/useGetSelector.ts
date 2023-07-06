import { useRef } from "react";
import { getSelector, getMultiSelector } from "../helpers/getSelector";
import { SingleSelector, MultiSelector } from "../helpers/types";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function useGetSelector(props: ComboboxContainerProps): SingleSelector {
    const selectorRef = useRef<SingleSelector | undefined>(undefined);
    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
    }
    selectorRef.current.updateProps(props);
    return selectorRef.current;
}
export function useGetMultiSelector(props: ComboboxContainerProps): MultiSelector {
    const selectorRef = useRef<MultiSelector | undefined>(undefined);
    if (!selectorRef.current) {
        selectorRef.current = getMultiSelector(props);
    }
    selectorRef.current.updateProps(props);
    return selectorRef.current;
}
