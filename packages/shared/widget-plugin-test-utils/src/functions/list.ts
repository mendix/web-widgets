import { ListValue, ObjectItem } from "mendix";
import { ListValueBuilder } from "../builders/ListValueBuilder";

/**
 * Returns `ListValue` mock.
 * @param arg - ether `number` or array of `ObjectItem`.
 * If number is given, fill `.items` with mock obj array. Array size depends on the number.
 */
export function list(arg: number | ObjectItem[]): ListValue {
    let builder = new ListValueBuilder();
    if (Array.isArray(arg)) {
        builder = builder.withItems(arg);
    } else {
        builder = builder.withSize(arg);
    }
    return builder.build();
}

/**
 * Returns `ListValue` with loading status.
 */
list.loading = () => new ListValueBuilder().isLoading().build();
