import { useRef, useState } from "react";
import { getSelector } from "../helpers/getSelector";
import { SingleSelector, MultiSelector } from "../helpers/types";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function useGetSelector(props: ComboboxContainerProps): SingleSelector | MultiSelector {
    const selectorRef = useRef<SingleSelector | MultiSelector | undefined>(undefined);
    const [, setInput] = useState({});
    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
        selectorRef.current.options.onAfterSearchTermChange(() => setInput({}));
    }
    selectorRef.current.updateProps(props);
    return selectorRef.current;
}
