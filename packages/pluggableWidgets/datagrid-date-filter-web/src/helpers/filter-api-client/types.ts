import { FilterContextValue } from "@mendix/widget-plugin-filtering";
import { DatagridDateFilterContainerProps } from "../../../typings/DatagridDateFilterProps";
import { FilterAPIClient } from "./FilterAPIClient";

export interface APIv1Props extends DatagridDateFilterContainerProps {
    apiv1: FilterContextValue;
}

export interface APIv2Props extends DatagridDateFilterContainerProps {
    filterAPIClient: FilterAPIClient;
}
