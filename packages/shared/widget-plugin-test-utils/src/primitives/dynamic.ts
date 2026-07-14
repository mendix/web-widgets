import { DynamicValue } from "mendix";
import { Status } from "../constants.js";

function available<T>(value: T): DynamicValue<T> {
    return { status: Status.Available, value };
}

function loading<T>(value?: T): DynamicValue<T> {
    return { status: Status.Loading, value };
}

function unavailable<T = unknown>(): DynamicValue<T> {
    return { status: Status.Unavailable, value: undefined };
}

export const dynamic = {
    available,
    loading,
    unavailable
};
