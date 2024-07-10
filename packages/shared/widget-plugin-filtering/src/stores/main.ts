import { ListAttributeValue } from "mendix";
import {
    DateInputFilterStore,
    InputFilterStore,
    NumberInputFilterStore,
    StringInputFilterStore
} from "./InputFilterStore";
import { StaticSelectFilterStore } from "./StaticSelectFilterStore";
import { RefFilterStore, RefFilterStoreProps } from "./RefFilterStore";

export type { InputFilterStore, RefFilterStoreProps };

export {
    DateInputFilterStore,
    NumberInputFilterStore,
    StringInputFilterStore,
    StaticSelectFilterStore,
    RefFilterStore
};

export function attrgroupFilterStore(
    type: ListAttributeValue["type"],
    attributes: ListAttributeValue[]
): InputFilterStore | StaticSelectFilterStore | null {
    switch (type) {
        case "DateTime":
            return new DateInputFilterStore(attributes as Array<ListAttributeValue<Date>>);

        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return new NumberInputFilterStore(attributes as Array<ListAttributeValue<Big>>);

        case "String":
            return new StringInputFilterStore(attributes as Array<ListAttributeValue<string>>);

        case "Boolean":
        case "Enum":
            return new StaticSelectFilterStore(attributes);
        default:
            console.error("attrgroupFilterStore: not supported type " + type, attributes);
            return null;
    }
}
