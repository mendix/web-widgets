import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { createElement, ReactElement } from "react";
import { DatagridDateFilterContainerProps } from "../typings/DatagridDateFilterProps";
import { Container } from "./components/DateFilterContainer";
import { withDateFilterAPI } from "./hocs/withDateFilterAPI";
import { isLoadingDefaultValues } from "./utils/widget-utils";

const container = withPreloader(Container, isLoadingDefaultValues);
const Widget = withDateFilterAPI(container);

export default function DatagridDateFilter(props: DatagridDateFilterContainerProps): ReactElement | null {
    return <Widget {...props} />;
}
