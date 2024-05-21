import { useDefaultValue } from "@mendix/widget-plugin-filtering";
import { InitValues } from "./base-types";
import { APIv2Props } from "./component-types";

export function useInitValues(props: APIv2Props): InitValues {
    const defaults: InitValues = {
        type: props.defaultFilter,
        startDate: useDefaultValue(props.defaultStartDate) ?? null,
        endDate: useDefaultValue(props.defaultEndDate) ?? null,
        value: useDefaultValue(props.defaultValue) ?? null
    };

    return props.filterAPIClient.initValues ?? defaults;
}
