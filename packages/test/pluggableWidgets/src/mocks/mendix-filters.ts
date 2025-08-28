// Mock implementation of mendix/filters for development testing
// This provides the basic functionality needed for the Combobox widget

export interface FilterCondition {
    type: "function" | "literal" | "attribute";
    name?: string;
    args?: FilterCondition[];
    arg1?: any;
    arg2?: any;
    value?: any;
    valueType?: string;
}

export interface ListAttributeValue {
    id: string;
    displayValue: string;
    value: any;
}

// Mock filter builders
export function attribute(id: string): any {
    return {
        id,
        type: "attribute"
    };
}

export function literal(value: any): any {
    const valueType =
        value === undefined
            ? "undefined"
            : typeof value === "string"
              ? "string"
              : typeof value === "number"
                ? "Numeric"
                : typeof value === "boolean"
                  ? "Boolean"
                  : value instanceof Date
                    ? "DateTime"
                    : "string";

    return {
        value,
        type: "literal",
        valueType
    };
}

export function contains(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "contains",
        arg1: attr,
        arg2: value
    };
}

export function startsWith(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "starts-with",
        arg1: attr,
        arg2: value
    };
}

export function and(...conditions: FilterCondition[]): FilterCondition {
    return {
        type: "function",
        name: "and",
        args: conditions
    };
}

export function notEqual(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "!=",
        arg1: attr,
        arg2: value
    };
}

export function equals(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "=",
        arg1: attr,
        arg2: value
    };
}

export function or(...conditions: FilterCondition[]): FilterCondition {
    return {
        type: "function",
        name: "or",
        args: conditions
    };
}

export function endsWith(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "ends-with",
        arg1: attr,
        arg2: value
    };
}

export function greaterThan(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: ">",
        arg1: attr,
        arg2: value
    };
}

export function greaterThanOrEqual(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: ">=",
        arg1: attr,
        arg2: value
    };
}

export function lessThan(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "<",
        arg1: attr,
        arg2: value
    };
}

export function lessThanOrEqual(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "<=",
        arg1: attr,
        arg2: value
    };
}

export function association(id: string): any {
    return {
        id,
        type: "association"
    };
}

// Day comparison functions used by DateInputFilterStore
export function dayEquals(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "day:=",
        arg1: attr,
        arg2: value
    };
}

export function dayNotEqual(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "day:!=",
        arg1: attr,
        arg2: value
    };
}

export function dayGreaterThan(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "day:>",
        arg1: attr,
        arg2: value
    };
}

export function dayGreaterThanOrEqual(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "day:>=",
        arg1: attr,
        arg2: value
    };
}

export function dayLessThan(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "day:<",
        arg1: attr,
        arg2: value
    };
}

export function dayLessThanOrEqual(attr: any, value: any): FilterCondition {
    return {
        type: "function",
        name: "day:<=",
        arg1: attr,
        arg2: value
    };
}

// Mock filters module export
export const filters = {
    contains,
    startsWith,
    endsWith,
    and,
    or,
    notEqual,
    equals,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    association,
    dayEquals,
    dayNotEqual,
    dayGreaterThan,
    dayGreaterThanOrEqual,
    dayLessThan,
    dayLessThanOrEqual
};
