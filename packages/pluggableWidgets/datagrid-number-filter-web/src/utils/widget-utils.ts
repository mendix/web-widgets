import { DynamicValue } from "mendix";

export function isLoadingDefaultValues(props: { defaultValue?: DynamicValue<Big> }): boolean {
    return props.defaultValue?.status === "loading";
}
