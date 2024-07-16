import { createElement, ReactElement } from "react";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { DatagridDateFilterContainerProps } from "../typings/DatagridDateFilterProps";
import { Container } from "./components/Container";
import { isLoadingDefaultValues } from "./utils/widget-utils";
import { withDateFilterAPI } from "./hocs/withFilterAPI";

const container = withPreloader(Container, isLoadingDefaultValues);
const Widget = withDateFilterAPI(container);

export default function DatagridDateFilter(props: DatagridDateFilterContainerProps): ReactElement | null {
    return <Widget {...props} />;
}
