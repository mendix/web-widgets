import { useDefaultValue } from "@mendix/widget-plugin-filtering";
import { InitValues } from "./base-types";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";

export function useInitValues(props: DatagridDateFilterContainerProps): InitValues {
    const defaults: InitValues = {
        type: props.defaultFilter,
        startDate: useDefaultValue(props.defaultStartDate) ?? null,
        endDate: useDefaultValue(props.defaultEndDate) ?? null,
        value: useDefaultValue(props.defaultValue) ?? null
    };

    return defaults;
}
