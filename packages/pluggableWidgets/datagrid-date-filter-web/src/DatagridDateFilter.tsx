import { createElement, ReactElement } from "react";
import { DatagridDateFilterContainerProps } from "../typings/DatagridDateFilterProps";
import { withAPIv1, withAPIv2, withPreloader } from "./helpers/HOCHelpers";
import { FilterComponent } from "./components/FilterComponent";

const Component = withAPIv1(withAPIv2(withPreloader(FilterComponent)));

export default function DatagridDateFilter(props: DatagridDateFilterContainerProps): ReactElement | null {
    return <Component {...props} />;
}
