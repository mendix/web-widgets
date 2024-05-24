import { useRef } from "react";
import { InitValues } from "./base-types";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";

export function useDefaultValues(props: DatagridDateFilterContainerProps): InitValues {
    const values: InitValues = useRef<InitValues>({
        type: props.defaultFilter,
        startDate: props.defaultStartDate?.value ?? null,
        endDate: props.defaultEndDate?.value ?? null,
        value: props.defaultValue?.value ?? null
    }).current;

    return values;
}
