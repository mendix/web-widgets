import { ListExpressionValue, ObjectItem } from "mendix";
import { dynamic } from "../primitives/dynamic";

export function listExp<T extends string | boolean | Date | Big>(get: (item: ObjectItem) => T): ListExpressionValue<T> {
    return { get: (item: ObjectItem) => dynamic<T>(get(item)) };
}
