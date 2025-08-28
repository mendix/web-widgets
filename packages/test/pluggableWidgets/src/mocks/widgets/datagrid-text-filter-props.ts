import type { DatagridTextFilterContainerProps } from "@mendix/datagrid-text-filter-web/typings/DatagridTextFilterProps";
import { createDynamicValue, createEditableValue } from "../widget-tools";

export function createMockDataGridTextFilterProps(): DatagridTextFilterContainerProps {
    return {
        name: "textFilter",
        class: "mx-text-filter",
        tabIndex: 0,

        // Attribute configuration
        attrChoice: "auto", // Let the filter auto-detect the attribute
        attributes: [], // Will be populated by the DataGrid based on column configuration

        // Default filter behavior
        defaultFilter: "contains",
        defaultValue: createDynamicValue(""),
        placeholder: createDynamicValue("Search..."),

        // Filter settings
        adjustable: true, // Allow users to change filter type (contains, starts with, etc.)
        delay: 500, // Delay in ms before applying filter

        // Optional value attribute for controlled filtering
        valueAttribute: createEditableValue(""),

        // Events
        onChange: undefined, // No custom onChange action for basic filtering

        // Accessibility labels
        screenReaderButtonCaption: createDynamicValue("Filter options"),
        screenReaderInputCaption: createDynamicValue("Search input")
    };
}

// Export individual filter variants for different use cases
export function createMockDataGridTextFilterPropsStrict(): DatagridTextFilterContainerProps {
    return {
        ...createMockDataGridTextFilterProps(),
        name: "textFilterStrict",
        defaultFilter: "equal",
        adjustable: false, // Fixed to exact match only
        placeholder: createDynamicValue("Enter exact value...")
    };
}

export function createMockDataGridTextFilterPropsStartsWith(): DatagridTextFilterContainerProps {
    return {
        ...createMockDataGridTextFilterProps(),
        name: "textFilterStartsWith",
        defaultFilter: "startsWith",
        adjustable: false, // Fixed to starts with
        placeholder: createDynamicValue("Type prefix...")
    };
}

// Keep the old export for backward compatibility (deprecated)
export const mockDataGridTextFilterProps = createMockDataGridTextFilterProps();
