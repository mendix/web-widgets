import { createElement, ReactElement } from "react";
import { FilterComponent } from "./components/FilterComponent";
import { DatagridDateFilterPreviewProps } from "../typings/DatagridDateFilterProps";
import { normalizeProps } from "./utils/widget-utils";
import { withAPIv1, withAPIv2, withPreloader } from "./helpers/HOCHelpers";

const Component = withAPIv1(withAPIv2(withPreloader(FilterComponent)));

export function preview(props: DatagridDateFilterPreviewProps): ReactElement {
    const ps = normalizeProps(props);
    return <Component {...ps} />;
}

export function getPreviewCss(): string {
    return require("react-datepicker/dist/react-datepicker.css");
}
