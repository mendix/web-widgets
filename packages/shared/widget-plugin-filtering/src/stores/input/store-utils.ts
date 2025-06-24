import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { APIError, NOT_FILTERABLE, UNSUPPORTED_ATTRIBUTE_TYPE } from "../../errors";
import { error, Result, value } from "../../result-meta";
import {
    Date_InputFilterInterface,
    InputFilterInterface,
    Number_InputFilterInterface,
    String_InputFilterInterface
} from "../../typings/InputFilterInterface";
import { DateInputFilterStore } from "../input/DateInputFilterStore";
import { NumberInputFilterStore } from "../input/NumberInputFilterStore";
import { StringInputFilterStore } from "../input/StringInputFilterStore";

export type InputFilterStore = StringInputFilterStore | NumberInputFilterStore | DateInputFilterStore;

export function attrgroupFilterStore(
    type: ListAttributeValue["type"],
    attribute: ListAttributeValue,
    initCond: FilterCondition | null
): Result<InputFilterStore | EnumFilterStore, APIError> {
    if (!attribute.filterable) {
        return error(NOT_FILTERABLE);
    }
    switch (type) {
        case "DateTime":
            return value(new DateInputFilterStore([attribute] as Array<ListAttributeValue<Date>>, initCond));

        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return value(new NumberInputFilterStore([attribute] as Array<ListAttributeValue<Big>>, initCond));

        case "String":
        case "HashString":
            return value(new StringInputFilterStore([attribute] as Array<ListAttributeValue<string>>, initCond));

        case "Boolean":
        case "Enum":
            return value(new EnumFilterStore([attribute], initCond));
        default:
            return error(UNSUPPORTED_ATTRIBUTE_TYPE);
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
