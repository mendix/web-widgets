import { FilterContextValue } from "@mendix/widget-plugin-filtering/provider";
import { DatagridDropdownFilterContainerProps } from "typings/DatagridDropdownFilterProps";

export interface FilterProps {
    widgetProps: DatagridDropdownFilterContainerProps;
    context: FilterContextValue;
}

export type OptionValue = string;

export interface Option {
    value: OptionValue;
    caption: string;
}
