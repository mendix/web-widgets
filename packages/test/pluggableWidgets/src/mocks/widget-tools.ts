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
    const editableValue = {
        __mockType: "EditableValue", // Marker for restoration
        value: value as T,
        displayValue: value ? String(value) : "",
        status: ValueStatus.Available,
        readonly: false,
        validation: undefined,
        formatter: {
            format: (val: T) => String(val)
        },
        setValue: function (newValue: T) {
            console.log("[MOCK] Setting editable value:", newValue);
            this.value = newValue;
            this.displayValue = newValue ? String(newValue) : "";
            // Trigger React re-render if callback is available
            if (typeof this._triggerRerender === "function") {
                this._triggerRerender();
            }
        }
    };

    return editableValue;
}

// Create list value mock
export function createListValue(items: ObjectItem[]): ListValue {
    // Create a stateful mock that maintains its own state
    const listValue = {
        status: ValueStatus.Available,
        items,
        totalCount: items.length,
        hasMoreItems: false,
        limit: 20,
        offset: 0,
        sortOrder: [["name", "asc"]] as Array<[string, "asc" | "desc"]>,
        filter: undefined,
        setLimit: function (limit: number) {
            console.log("Setting limit:", limit);
            // Update the limit on this object
            this.limit = limit;
            // Simulate potential state changes
            this.hasMoreItems = limit < this.totalCount;
        },
        setOffset: function (offset: number) {
            console.log("Setting offset:", offset);
            // Update the offset on this object
            this.offset = offset;
        },
        setFilter: function (filter: any) {
            console.log("Setting filter:", filter);
            // Update the filter on this object
            this.filter = filter;
        },
        setSortOrder: function (sortOrder: Array<[string, "asc" | "desc"]>) {
            console.log("Setting sort order:", sortOrder);
            // Update the sort order on this object
            this.sortOrder = sortOrder;
        },
        requestTotalCount: function (needTotal: boolean) {
            console.log("Requesting total count:", needTotal);
            // Mock implementation - in real Mendix this would trigger a server request
            // For now, just ensure totalCount is set if needed
            if (needTotal && this.totalCount === undefined) {
                this.totalCount = this.items?.length || 0;
            }
        },
        reload: function () {
            console.log("Reloading list");
            // Reset to initial state
            this.offset = 0;
            this.filter = undefined;
        }
    };

    return listValue;
}

// Create list attribute value mock
export function createListAttributeValue<T>(): ListAttributeValue<T> {
    return {
        __mockType: "ListAttributeValue", // Marker for restoration
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
        __mockType: "ListExpressionValue", // Marker for restoration
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
        __mockType: "ReferenceValue", // Marker for restoration
        type: "Reference" as const, // Important: This determines single vs multi selector
        value: selectedItem || null,
        displayValue: selectedItem ? `Reference ${selectedItem.id}` : "No item selected",
        status: ValueStatus.Available,
        readOnly: false,
        validation: undefined,
        formatter: {
            format: (val: ObjectItem | null) => (val ? `Reference ${val.id}` : "")
        },
        setValue: function (value: ObjectItem | null) {
            console.log("[MOCK] Setting reference value:", value);
            this.value = value;
            this.displayValue = value ? `Reference ${value.id}` : "No item selected";
            // Trigger React re-render if callback is available
            if (typeof this._triggerRerender === "function") {
                this._triggerRerender();
            }
        },
        setValidator: function () {
            console.log("[MOCK] Setting validator for reference value");
        }
    } as ReferenceValue;

    return refValue;
}

// Create reference set value mock (for multi-selection)
export function createReferenceSetValue(selectedItems: ObjectItem[] = []): ReferenceSetValue {
    const refSetValue = {
        __mockType: "ReferenceSetValue", // Marker for restoration
        type: "ReferenceSet" as const, // Important: This determines single vs multi selector
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
        setValue: function (value: ObjectItem[]) {
            console.log("[MOCK] Setting reference set value:", value);
            this.value = value;
            this.displayValue =
                value.length > 0 ? value.map(item => `Reference ${item.id}`).join(", ") : "No items selected";
            // Trigger React re-render if callback is available
            if (typeof this._triggerRerender === "function") {
                this._triggerRerender();
            }
        },
        setValidator: function () {
            console.log("[MOCK] Setting validator for reference set value");
        }
    };

    return refSetValue;
}

// Create mock object items
export function createMockObjectItem(id: string): ObjectItem {
    return { id };
}

// Create multiple mock object items
export function createMockObjectItems(count: number, prefix: string = "item"): ObjectItem[] {
    return Array.from({ length: count }, (_, index) => createMockObjectItem(`${prefix}${index + 1}`));
}
