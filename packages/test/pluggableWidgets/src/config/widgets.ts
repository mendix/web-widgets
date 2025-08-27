import { lazy } from "react";
import { mockProps } from "../mocks/combobox-props";
import { mockCheckboxProps } from "../mocks/checkbox-radio-props";

// Lazy load the components
const Combobox = lazy(() => import("@mendix/combobox-web/src/Combobox"));
const CheckboxRadioSelection = lazy(() => import("@mendix/checkbox-radio-selection-web/src/CheckboxRadioSelection"));

// Widget types
export type WidgetType = "combobox" | "checkbox";

export interface WidgetInfo {
    id: WidgetType;
    name: string;
    description: string;
    component: React.LazyExoticComponent<any>;
    props: any;
}

// Widget configuration
export const widgets: WidgetInfo[] = [
    {
        id: "combobox",
        name: "Combobox Widget",
        description: "Multi-selection combobox with association data source and filtering capabilities.",
        component: Combobox,
        props: mockProps
    },
    {
        id: "checkbox",
        name: "Checkbox Selection Widget",
        description: "Multi-selection checkbox group with association data source.",
        component: CheckboxRadioSelection,
        props: mockCheckboxProps
    }
];
