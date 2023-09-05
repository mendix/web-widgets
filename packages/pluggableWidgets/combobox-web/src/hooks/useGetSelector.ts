import { useRef, useState } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { getSelector } from "../helpers/getSelector";
import { MultiSelector, SingleSelector } from "../helpers/types";

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
