import { ListExpressionValue, ObjectItem } from "mendix";
import { dynamic } from "../primitives/dynamic";

/**
 * Returns `ListExpressionValue` mock.
 * @param get - function to use as `.get`. Should map item to value.
 */
export function listExpression<T extends string | boolean | Date | Big>(
    get: (item: ObjectItem) => T
): ListExpressionValue<T> {
    return { get: (item: ObjectItem) => dynamic<T>(get(item)) };
}

/** @deprecated Renamed to `listExpression` */
export const listExp = listExpression;
