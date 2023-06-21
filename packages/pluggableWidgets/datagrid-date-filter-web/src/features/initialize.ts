import { DefaultFilterEnum } from "../../typings/DatagridDateFilterProps";
import { useEffect } from "react";

interface Props {
    initialFilterValue?: Date | [Date | undefined, Date | undefined];
    initialFilterType: DefaultFilterEnum;
    updateFilters?: (
        value: Date | undefined,
        rangeValues: [Date | undefined, Date | undefined],
        type: DefaultFilterEnum
    ) => void;
}

export function useSetInitialConditionEffect(props: Props): void {
    useEffect(() => {
        if (props.initialFilterValue !== undefined) {
            if (Array.isArray(props.initialFilterValue)) {
                props.updateFilters?.(undefined, props.initialFilterValue, props.initialFilterType);
            } else {
                props.updateFilters?.(props.initialFilterValue, [undefined, undefined], props.initialFilterType);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
