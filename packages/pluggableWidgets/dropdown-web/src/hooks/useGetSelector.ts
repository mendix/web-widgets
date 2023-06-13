import { useRef } from "react";
import { getSelector } from "../helpers/getSelector";
import { SingleSelector } from "../helpers/types";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function useGetSelector(props: ComboboxContainerProps): SingleSelector {
    const selectorRef = useRef<SingleSelector | undefined>(undefined);
    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
    }
    selectorRef.current.updateProps(props);
    return selectorRef.current;
}
