import { ListAttributeValue } from "mendix";
import { AllFunctions } from "@mendix/filter-commons/typings/FilterFunctions";
import { FilterData } from "@mendix/filter-commons/typings/settings";

/** An attribute the developer made available for Dynamic Filters. */
export interface FilterFieldConfig {
    /** Developer-specified, stable key. Used to persist rows. */
    key: string;
    attribute: ListAttributeValue;
    /** Name shown to end users. */
    label: string;
}

/** Replaces the automatic values of an enumeration or Boolean Filter Field. */
export interface FilterFieldOption {
    fieldKey: string;
    caption: string;
    value: string;
}

export type FilterKind = "text" | "number" | "date" | "enum";

/** One persisted Dynamic Filter. `data` is the row store's own `toJSON()` output. */
export interface PersistedDynamicFilter {
    field: string;
    data: FilterData;
}

export const KIND_FUNCTIONS: Record<Exclude<FilterKind, "enum">, ReadonlySet<AllFunctions>> = {
    text: new Set<AllFunctions>([
        "contains",
        "startsWith",
        "endsWith",
        "greater",
        "greaterEqual",
        "equal",
        "notEqual",
        "smaller",
        "smallerEqual",
        "empty",
        "notEmpty"
    ]),
    number: new Set<AllFunctions>([
        "greater",
        "greaterEqual",
        "equal",
        "notEqual",
        "smaller",
        "smallerEqual",
        "empty",
        "notEmpty"
    ]),
    date: new Set<AllFunctions>([
        "between",
        "greater",
        "greaterEqual",
        "equal",
        "notEqual",
        "smaller",
        "smallerEqual",
        "empty",
        "notEmpty"
    ])
};

/** Same defaults as the Text, Number and Date filter widgets. */
export const KIND_DEFAULT_FUNCTION: Record<Exclude<FilterKind, "enum">, AllFunctions> = {
    text: "contains",
    number: "equal",
    date: "equal"
};

export function kindOf(type: ListAttributeValue["type"]): FilterKind | null {
    switch (type) {
        case "String":
        case "HashString":
            return "text";
        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return "number";
        case "DateTime":
            return "date";
        case "Enum":
        case "Boolean":
            return "enum";
        default:
            return null;
    }
}
