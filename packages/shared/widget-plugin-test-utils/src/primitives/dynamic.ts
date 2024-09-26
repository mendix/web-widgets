import { DynamicValue } from "mendix";
import { Status } from "../constants.js";

export function dynamic<T>(value?: T, loading = false): DynamicValue<T> {
    if (value === undefined) {
        return { status: Status.Unavailable, value: undefined };
    }
    return { status: loading ? Status.Loading : Status.Available, value };
}

/** @deprecated renamed to {@link dynamic} */
export const dynamicValue = dynamic;
