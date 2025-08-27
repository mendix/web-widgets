// Mock restoration utilities
// When props are serialized to JSON and back, function references are lost
// This module helps restore function references in mock objects

import {
    createDynamicValue,
    createEditableValue,
    createListValue,
    createListAttributeValue,
    createListExpressionValue,
    createReferenceValue,
    createReferenceSetValue,
    createMockObjectItems,
    createMockObjectItem
} from "./widget-tools";
import type { ObjectItem } from "./mendix";

// Restore functions in a ListValue object
export function restoreListValueFunctions(obj: any): any {
    if (obj && typeof obj === "object" && obj.hasOwnProperty("limit") && obj.hasOwnProperty("offset")) {
        // This looks like a ListValue object that needs function restoration
        const items = obj.items || [];
        const restoredListValue = createListValue(items);

        // Preserve the current state but restore functions
        return {
            ...restoredListValue,
            ...obj,
            // Ensure functions are restored
            setLimit: restoredListValue.setLimit,
            setOffset: restoredListValue.setOffset,
            setFilter: restoredListValue.setFilter,
            reload: restoredListValue.reload
        };
    }
    return obj;
}

// Restore functions in ListAttributeValue objects
export function restoreListAttributeValueFunctions(obj: any): any {
    if (obj && typeof obj === "object" && obj.__mockType === "ListAttributeValue") {
        // This is definitely a ListAttributeValue

        const restored = createListAttributeValue();
        return {
            ...restored,
            ...obj,
            get: restored.get // Restore the get function
        };
    }
    return obj;
}

// Restore functions in ListExpressionValue objects
export function restoreListExpressionValueFunctions(obj: any): any {
    if (obj && typeof obj === "object" && obj.__mockType === "ListExpressionValue") {
        // This is definitely a ListExpressionValue

        const restored = createListExpressionValue("mockExpression");
        return {
            ...restored,
            ...obj,
            get: restored.get // Restore the get function
        };
    }
    return obj;
}

// Restore functions in EditableValue objects
export function restoreEditableValueFunctions(obj: any): any {
    if (obj && typeof obj === "object" && obj.__mockType === "EditableValue") {
        // This is definitely an EditableValue
        console.log("[RESTORE] Restoring EditableValue with value:", obj.value);
        const restored = createEditableValue(obj.value);

        // Preserve the re-render callback if it exists
        if (obj._triggerRerender) {
            restored._triggerRerender = obj._triggerRerender;
        }

        return {
            ...restored,
            ...obj,
            setValue: restored.setValue // Restore the setValue function
        };
    }
    return obj;
}

// Restore functions in ReferenceValue objects
export function restoreReferenceValueFunctions(obj: any): any {
    if (obj && typeof obj === "object" && obj.__mockType === "ReferenceValue") {
        // This is definitely a ReferenceValue
        console.log("[RESTORE] Restoring ReferenceValue with value:", obj.value);
        const restored = createReferenceValue(obj.value);

        // Preserve the re-render callback if it exists
        if (obj._triggerRerender) {
            restored._triggerRerender = obj._triggerRerender;
        }

        return {
            ...restored,
            ...obj,
            setValue: restored.setValue,
            setValidator: restored.setValidator
        };
    }
    return obj;
}

// Restore functions in ReferenceSetValue objects
export function restoreReferenceSetValueFunctions(obj: any): any {
    if (obj && typeof obj === "object" && obj.__mockType === "ReferenceSetValue") {
        // This is definitely a ReferenceSetValue
        console.log("[RESTORE] Restoring ReferenceSetValue with value:", obj.value);
        const restored = createReferenceSetValue(obj.value || []);

        // Preserve the re-render callback if it exists
        if (obj._triggerRerender) {
            restored._triggerRerender = obj._triggerRerender;
        }

        return {
            ...restored,
            ...obj,
            setValue: restored.setValue,
            setValidator: restored.setValidator
        };
    }
    return obj;
}

// Deep restore functions in any object
export function deepRestoreFunctions(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepRestoreFunctions(item));
    }

    // Try different restoration strategies
    let restored = obj;

    // Try different restoration strategies in order
    const originalRestored = restored;

    // Try specific marker-based restoration first (more reliable)
    restored = restoreEditableValueFunctions(restored);
    restored = restoreReferenceValueFunctions(restored);
    restored = restoreReferenceSetValueFunctions(restored);
    restored = restoreListAttributeValueFunctions(restored);
    restored = restoreListExpressionValueFunctions(restored);

    // Try legacy restoration for objects without markers
    restored = restoreListValueFunctions(restored);

    // Continue processing if restoration happened

    // Recursively restore nested objects
    const result: any = {};
    for (const [key, value] of Object.entries(restored)) {
        result[key] = deepRestoreFunctions(value);
    }

    return result;
}
