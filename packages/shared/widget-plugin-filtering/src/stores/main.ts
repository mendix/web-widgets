import { ListAttributeValue } from "mendix";
import { DateInputFilterStore } from "./DateInputFilterStore";
import { NumberInputFilterStore } from "./NumberInputFilterStore";
import { RefFilterStore, RefFilterStoreProps } from "./RefFilterStore";
import { StaticSelectFilterStore } from "./StaticSelectFilterStore";
import { StringInputFilterStore } from "./StringInputFilterStore";
import {
    Date_InputFilterInterface,
    InputFilterInterface,
    Number_InputFilterInterface,
    String_InputFilterInterface
} from "./typings/InputFilterInterface";

type InputFilterStore = StringInputFilterStore | NumberInputFilterStore | DateInputFilterStore;

export type {
    Date_InputFilterInterface,
    InputFilterInterface,
    InputFilterStore,
    Number_InputFilterInterface,
    RefFilterStoreProps,
    String_InputFilterInterface
};

export {
    DateInputFilterStore,
    NumberInputFilterStore,
    RefFilterStore,
    StaticSelectFilterStore,
    StringInputFilterStore
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

export function isNumberFilter(store: InputFilterInterface): store is Number_InputFilterInterface {
    return store.arg1.type === "number";
}

export function isStringFilter(store: InputFilterInterface): store is String_InputFilterInterface {
    return store.arg1.type === "string";
}

export function isDateFilter(store: InputFilterInterface): store is Date_InputFilterInterface {
    return store.arg1.type === "date";
}
