import { ListValue, ObjectItem } from "mendix";
import { ListValueBuilder } from "../builders/ListValueBuilder";

export function list(arg: number | ObjectItem[]): ListValue {
    let builder = new ListValueBuilder();
    if (Array.isArray(arg)) {
        builder = builder.withItems(arg);
    } else {
        builder = builder.withSize(arg);
    }
    return builder.build();
}
