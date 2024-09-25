import { ListValue } from "mendix";
import { objArray } from "../primitives/objArray";
import { ListValueBuilder } from "../builders/ListValueBuilder";

export function list(n: number): ListValue {
    return ListValueBuilder().withItems(objArray(n));
}
