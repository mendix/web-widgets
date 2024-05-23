import { createElement, ReactElement } from "react";
import { DatagridDateFilterContainerProps } from "../typings/DatagridDateFilterProps";
import { withAPIv1, withAPIv2 } from "./hocs/withFilterAPI";
import { withPreloader } from "./hocs/withPreloader";
import { FilterComponent } from "./components/FilterComponent";
import { withRuntimeAdapter } from "./hocs/withRuntimeAdapter";

const Component = withAPIv1(withAPIv2(withPreloader(withRuntimeAdapter(FilterComponent))));

export default function DatagridDateFilter(props: DatagridDateFilterContainerProps): ReactElement | null {
    return <Component {...props} />;
}
