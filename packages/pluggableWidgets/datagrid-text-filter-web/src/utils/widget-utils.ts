import { DynamicValue } from "mendix";

export function isLoadingDefaultValues(props: { defaultValue?: DynamicValue<string> }): boolean {
    return props.defaultValue?.status === "loading";
}
