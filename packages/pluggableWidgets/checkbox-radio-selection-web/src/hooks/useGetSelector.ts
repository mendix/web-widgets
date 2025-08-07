import { useRef, useState } from "react";
import { CheckboxRadioSelectionContainerProps } from "../../typings/CheckboxRadioSelectionProps";
import { getSelector } from "../helpers/getSelector";
import { Selector } from "../helpers/types";

export function useGetSelector(props: CheckboxRadioSelectionContainerProps): Selector {
    const selectorRef = useRef<Selector | undefined>(undefined);
    const [, setInput] = useState({});
    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
        selectorRef.current.options.onAfterSearchTermChange(() => setInput({}));
    }
    selectorRef.current.updateProps(props);
    return selectorRef.current;
}
