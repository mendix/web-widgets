import { DynamicValue } from "mendix";
import { Status } from "../constants.js";

export function dynamic<T>(value?: T, loading?: boolean): DynamicValue<T> {
    if (loading) {
        return { status: Status.Loading, value };
    }
    return value !== undefined ? { status: Status.Available, value } : { status: Status.Unavailable, value: undefined };
}

/** @deprecated renamed to {@link dynamic} */
export const dynamicValue = dynamic;
