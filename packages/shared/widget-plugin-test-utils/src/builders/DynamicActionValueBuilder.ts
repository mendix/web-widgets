import type { ActionValue, DynamicValue } from "mendix";
import { Status } from "../constants.js";

export function dynamicValue<T>(value?: T, loading?: boolean): DynamicValue<T> {
    if (loading) {
        return { status: Status.Loading, value };
    }
    return value !== undefined ? { status: Status.Available, value } : { status: Status.Unavailable, value: undefined };
}

export function actionValue(canExecute = true, isExecuting = false): ActionValue {
    return { canExecute, isExecuting, execute: jest.fn() };
}
