import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";

export function isLoadingDefaultValues(props: DatagridDateFilterContainerProps): boolean {
    const statusList = [props.defaultValue?.status, props.defaultStartDate?.status, props.defaultEndDate?.status];
    return statusList.some(status => status === "loading");
}
