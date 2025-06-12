import { DynamicValue } from "mendix";

export interface FilterOptionsType {
    caption: DynamicValue<string>;
    value: DynamicValue<string>;
}

export type SelectedItemsStyleEnum = "text" | "boxes";

export type SelectionMethodEnum = "checkbox" | "rowClick";
