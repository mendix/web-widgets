import { ListValue } from "mendix";
import { ListValueBuilder } from "../builders/ListValueBuilder";

export function list(n: number): ListValue {
    return new ListValueBuilder().withSize(n).build();
}
