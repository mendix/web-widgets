import { FilterContextValue } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { DatagridDropdownFilterContainerProps } from "typings/DatagridDropdownFilterProps";

export interface FilterProps {
    widgetProps: DatagridDropdownFilterContainerProps;
    context: FilterContextValue;
}
