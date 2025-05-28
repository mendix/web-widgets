import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import {
    Date_InputFilterInterface,
    InputFilterInterface,
    Number_InputFilterInterface,
    String_InputFilterInterface
} from "../../typings/InputFilterInterface";
import { DateInputFilterStore } from "../input/DateInputFilterStore";
import { NumberInputFilterStore } from "../input/NumberInputFilterStore";
import { StringInputFilterStore } from "../input/StringInputFilterStore";
import { StaticSelectFilterStore } from "../picker/StaticSelectFilterStore";

export type InputFilterStore = StringInputFilterStore | NumberInputFilterStore | DateInputFilterStore;

export function attrgroupFilterStore(
    type: ListAttributeValue["type"],
    attributes: ListAttributeValue[],
    initCond: FilterCondition | null
): InputFilterStore | StaticSelectFilterStore | null {
    switch (type) {
        case "DateTime":
            return new DateInputFilterStore(attributes as Array<ListAttributeValue<Date>>, initCond);

        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return new NumberInputFilterStore(attributes as Array<ListAttributeValue<Big>>, initCond);

        case "String":
        case "HashString":
            return new StringInputFilterStore(attributes as Array<ListAttributeValue<string>>, initCond);

        case "Boolean":
        case "Enum":
            return new StaticSelectFilterStore(attributes, initCond);
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
