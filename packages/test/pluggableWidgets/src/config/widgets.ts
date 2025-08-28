import { lazy } from "react";
import { createMockComboboxProps } from "../mocks/widgets/combobox-props";
import { createMockCheckboxProps } from "../mocks/widgets/checkbox-radio-props";
import { createMockDataGridProps, createMockDataGridPropsCompact } from "../mocks/widgets/datagrid-props";

// Lazy load the components
const Combobox = lazy(() => import("@mendix/combobox-web/src/Combobox"));
const CheckboxRadioSelection = lazy(() => import("@mendix/checkbox-radio-selection-web/src/CheckboxRadioSelection"));
const Datagrid = lazy(() => import("@mendix/datagrid-web/src/Datagrid"));

// Widget types - now includes variants
export type WidgetType = "combobox" | "checkbox" | "datagrid";

export interface WidgetVariant {
    id: string; // Unique identifier for this variant
    name: string; // Display name for this variant
    description: string;
    props: any; // This will now be a fresh instance for each widget
    createProps: () => any; // Factory function to create fresh props
    enableJsonEditor?: boolean; // Flag to enable interactive JSON props editor
}

export interface WidgetInfo {
    id: WidgetType;
    name: string;
    description: string;
    component: React.LazyExoticComponent<any>;
    // Support both single props (legacy) and multiple variants
    variants?: WidgetVariant[];
    // Legacy single variant support
    props?: any;
    createProps?: () => any;
    enableJsonEditor?: boolean;
}

// Widget configuration with factory functions for fresh props
export const widgets: WidgetInfo[] = [
    {
        id: "combobox",
        name: "Combobox Widget",
        description: "Multi-selection combobox with association data source and filtering capabilities.",
        component: Combobox,
        props: createMockComboboxProps(), // Initialize with fresh props
        createProps: createMockComboboxProps, // Factory for creating fresh instances
        enableJsonEditor: true
    },
    {
        id: "checkbox",
        name: "Checkbox Selection Widget",
        description: "Multi-selection checkbox group with association data source.",
        component: CheckboxRadioSelection,
        props: createMockCheckboxProps(), // Initialize with fresh props
        createProps: createMockCheckboxProps, // Factory for creating fresh instances
        enableJsonEditor: true
    },
    {
        id: "datagrid",
        name: "Data Grid 2 Widget",
        description: "Advanced data grid with filtering, sorting, pagination, and column management.",
        component: Datagrid,
        variants: [
            {
                id: "datagrid-standard",
                name: "Standard DataGrid",
                description: "Full-featured data grid with all columns, filtering, and advanced features enabled.",
                props: createMockDataGridProps(),
                createProps: createMockDataGridProps,
                enableJsonEditor: true
            },
            {
                id: "datagrid-compact",
                name: "Compact DataGrid",
                description: "Simplified data grid with minimal columns, radio button selection, and compact layout.",
                props: createMockDataGridPropsCompact(),
                createProps: createMockDataGridPropsCompact,
                enableJsonEditor: true
            }
        ]
    }
];
