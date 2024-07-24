import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { createElement, ReactElement } from "react";
import { DatagridTextFilterContainerProps } from "../typings/DatagridTextFilterProps";
import { TextFilterContainer } from "./components/TextFilterContainer";
import { withTextFilterAPI } from "./hocs/withTextFilterAPI";
import { isLoadingDefaultValues } from "./utils/widget-utils";

const container = withPreloader<DatagridTextFilterContainerProps>(TextFilterContainer, isLoadingDefaultValues);
const Widget = withTextFilterAPI(container);

export default function DatagridTextFilter(props: DatagridTextFilterContainerProps): ReactElement {
    return <Widget {...props} />;
}
