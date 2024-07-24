import { ReactElement, createElement } from "react";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { DatagridNumberFilterContainerProps } from "../typings/DatagridNumberFilterProps";
import { NumberFilterContainer } from "./components/NumberFilterContainer";
import { isLoadingDefaultValues } from "./utils/widget-utils";
import { withNumberFilterAPI } from "./hocs/withNumberFilterAPI";

const container = withPreloader<DatagridNumberFilterContainerProps>(NumberFilterContainer, isLoadingDefaultValues);
const Widget = withNumberFilterAPI(container);

export default function DatagridNumberFilter(props: DatagridNumberFilterContainerProps): ReactElement {
    return <Widget {...props} />;
}
