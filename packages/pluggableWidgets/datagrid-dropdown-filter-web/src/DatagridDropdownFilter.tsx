import { createElement, ReactElement } from "react";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
import { StaticFilterContainer } from "./components/StaticFilterContainer";
import { withSelectFilterAPI, Select_FilterAPIv2 } from "./hocs/withSelectFilterAPI";

interface Props extends Select_FilterAPIv2, DatagridDropdownFilterContainerProps {}

function Container(props: Props): React.ReactElement {
    return <StaticFilterContainer {...props} multiselect={props.multiSelect} />;
}

const container = withPreloader(Container, props => props.defaultValue?.status === "loading");

const Widget = withSelectFilterAPI(container);

export default function DatagridDropdownFilter(props: DatagridDropdownFilterContainerProps): ReactElement {
    return <Widget {...props} />;
}
