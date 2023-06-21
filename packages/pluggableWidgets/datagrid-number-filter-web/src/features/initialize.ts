import Big from "big.js";
import { FilterType } from "../../typings/FilterType";
import { useEffect } from "react";

interface Props {
    initialFilterValue?: Big;
    initialFilterType: FilterType;
    updateFilters?: (value: Big | undefined, type: FilterType) => void;
}

export function useSetInitialConditionEffect(props: Props): void {
    useEffect(() => {
        if (props.initialFilterValue !== undefined) {
            props.updateFilters?.(props.initialFilterValue, props.initialFilterType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
