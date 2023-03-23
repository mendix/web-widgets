import { useRef } from "react";
import { getSelector } from "../helpers/getSelector";
import { SingleSelector } from "../helpers/types";
import { DropdownContainerProps } from "../../typings/DropdownProps";

export function useGetSelector(props: DropdownContainerProps): SingleSelector {
    const selectorRef = useRef<SingleSelector | undefined>(undefined);
    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
    }
    selectorRef.current.updateProps(props);
    return selectorRef.current;
}
