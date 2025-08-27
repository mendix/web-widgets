// Utility functions for creating widget mock data
// This file contains reusable mock functions for Mendix widget development and testing

import {
    DynamicValue,
    EditableValue,
    ListValue,
    ListAttributeValue,
    ListExpressionValue,
    ReferenceSetValue,
    ReferenceValue,
    ObjectItem,
    ValueStatus
} from "./mendix";

// Create dynamic value mock
export function createDynamicValue<T>(value: T): DynamicValue<T> {
    return {
        value,
        status: ValueStatus.Available,
        validation: undefined
    } as DynamicValue<T>;
}

// Create editable value mock
export function createEditableValue<T>(value?: T): EditableValue<T> {
    return {
        value: value as T,
        displayValue: value ? String(value) : "",
        status: ValueStatus.Available,
        readonly: false,
        validation: undefined,
        formatter: {
            format: (val: T) => String(val)
        },
        setValue: (newValue: T) => {
            console.log("Setting value:", newValue);
        }
    };
}

// Create list value mock
export function createListValue(items: ObjectItem[]): ListValue {
    return {
        status: ValueStatus.Available,
        items,
        totalCount: items.length,
        hasMoreItems: false,
        limit: 20,
        offset: 0,
        sortOrder: [["name", "asc"]], // Default sort order
        filter: undefined,
        setLimit: (limit: number) => {
            console.log("Setting limit:", limit);
        },
        setOffset: (offset: number) => {
            console.log("Setting offset:", offset);
        },
        setFilter: (filter: any) => {
            console.log("Setting filter:", filter);
        },
        reload: () => {
            console.log("Reloading list");
        }
    };
}

// Create list attribute value mock
export function createListAttributeValue<T>(): ListAttributeValue<T> {
    return {
        id: "mockAttribute",
        get: (item: ObjectItem) => ({
            value: `Value for ${item.id}` as T,
            displayValue: `Display Value for ${item.id}`,
            status: ValueStatus.Available,
            readonly: false,
            formatter: {
                format: (val: T) => String(val)
            }
        }),
        sortable: true,
        filterable: true,
        type: "String",
        validation: undefined
    } as ListAttributeValue<T>;
}

// Create list expression value mock
export function createListExpressionValue<T>(expression: string): ListExpressionValue<T> {
    return {
        get: (item: ObjectItem) => ({
            value: `Expression result for ${item.id}` as T,
            displayValue: `Expression Display for ${item.id}`,
            status: ValueStatus.Available
        })
    } as ListExpressionValue<T>;
}

// Create reference value mock (for single-selection)
export function createReferenceValue(selectedItem?: ObjectItem): ReferenceValue {
    const refValue = {
        type: "Reference", // Important: This determines single vs multi selector
        value: selectedItem || null,
        displayValue: selectedItem ? `Reference ${selectedItem.id}` : "No item selected",
        status: ValueStatus.Available,
        readOnly: false,
        validation: undefined,
        formatter: {
            format: (val: ObjectItem | null) => (val ? `Reference ${val.id}` : "")
        },
        setValue: (value: ObjectItem | null) => {
            console.log("Setting reference value:", value);
        },
        setValidator: () => {
            console.log("Setting validator for reference value");
        }
    } as ReferenceValue;

    return refValue;
}

// Create reference set value mock (for multi-selection)
export function createReferenceSetValue(selectedItems: ObjectItem[] = []): ReferenceSetValue {
    return {
        type: "ReferenceSet", // Important: This determines single vs multi selector
        value: selectedItems,
        displayValue:
            selectedItems.length > 0
                ? selectedItems.map(item => `Reference ${item.id}`).join(", ")
                : "No items selected",
        status: ValueStatus.Available,
        readOnly: false,
        validation: undefined,
        formatter: {
            format: (val: ObjectItem[]) => (val ? val.map(v => `Reference ${v.id}`).join(", ") : "")
        },
        setValue: (value: ObjectItem[]) => {
            console.log("Setting reference set value:", value);
        },
        setValidator: () => {
            console.log("Setting validator for reference set value");
        }
    };
}

// Create mock object items
export function createMockObjectItem(id: string): ObjectItem {
    return { id };
}

// Create multiple mock object items
export function createMockObjectItems(count: number, prefix: string = "item"): ObjectItem[] {
    return Array.from({ length: count }, (_, index) => createMockObjectItem(`${prefix}${index + 1}`));
}
