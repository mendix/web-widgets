import { ListAttributeValue, ObjectItem } from "mendix";
import { ListAttributeValueBuilder } from "../builders/ListAttributeValueBuilder";
import { editable } from "../primitives/editable";

/**
 * Returns `ListAttributeValue` mock.
 * @param get - function to use as `.get`. Should map item to value.
 */
export function listAttribute<T extends string | boolean | Date | Big>(
    get: (item: ObjectItem) => T
): ListAttributeValue<T> {
    const attr = new ListAttributeValueBuilder<T>().build();
    attr.get = jest.fn((item: ObjectItem) => editable<T>(b => b.withValue(get(item)).isReadOnly().build()));
    return attr;
}

/** @deprecated Renamed to `listAttribute`. */
export const listAttr = listAttribute;
