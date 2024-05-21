import { FilterContextValue } from "@mendix/widget-plugin-filtering";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { FilterAPIClient } from "./filter-api-client/FilterAPIClient";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";

export interface APIv1Props extends DatagridDateFilterContainerProps {
    apiv1: FilterContextValue;
}

export interface APIv2Props extends DatagridDateFilterContainerProps {
    filterAPIClient: FilterAPIClient;
}

export interface DatePickerBackendProps extends ReactDatePickerProps, React.ClassAttributes<ReactDatePicker> {}
