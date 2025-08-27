// Mock implementation of mendix/filters for development testing
// This provides the basic functionality needed for the Combobox widget

export interface FilterCondition {
    id: string;
    type: string;
    value: any;
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
    return {
        value,
        type: "literal"
    };
}

export function contains(attr: any, value: any): FilterCondition {
    return {
        id: `${attr.id}_contains_${value.value}`,
        type: "contains",
        value: { attribute: attr, literal: value }
    };
}

export function startsWith(attr: any, value: any): FilterCondition {
    return {
        id: `${attr.id}_startsWith_${value.value}`,
        type: "startsWith",
        value: { attribute: attr, literal: value }
    };
}

// Mock filters module export
export const filters = {
    contains,
    startsWith
};
