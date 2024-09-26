import { ListAttributeValue, ObjectItem } from "mendix";
import { ListAttributeValueBuilder } from "../builders/ListAttributeValueBuilder";
import { editable } from "../primitives/editable";

export function listAttr<T extends string | boolean | Date | Big>(get: (item: ObjectItem) => T): ListAttributeValue<T> {
    const attr = new ListAttributeValueBuilder<T>().build();
    attr.get = jest.fn((item: ObjectItem) => editable<T>(b => b.withValue(get(item)).isReadOnly().build()));
    return attr;
}
