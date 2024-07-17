import { DynamicValue } from "mendix";

export function isLoadingDefaultValues(props: { defaultValue?: DynamicValue<string> }): boolean {
    const statusList = [props.defaultValue?.status];
    return statusList.some(status => status === "loading");
}
