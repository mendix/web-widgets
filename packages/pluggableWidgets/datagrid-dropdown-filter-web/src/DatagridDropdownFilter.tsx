import { createElement, ReactElement } from "react";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
import { StaticFilterContainer } from "./components/StaticFilterContainer";
import { withSelectFilterAPI, Select_FilterAPIv2 } from "./hocs/withSelectFilterAPI";
import { RefFilterContainer } from "./components/RefFilterContainer";

function Container(props: DatagridDropdownFilterContainerProps & Select_FilterAPIv2): React.ReactElement {
    if (props.filterStore.type === "refselect") {
        return (
            <RefFilterContainer
                filterStore={props.filterStore}
                multiselect={props.multiSelect}
                emptyCaption={props.emptyOptionCaption?.value}
            />
        );
    }

    return (
        <StaticFilterContainer
            filterStore={props.filterStore}
            filterOptions={props.filterOptions}
            multiselect={props.multiSelect}
            defaultValue={props.defaultValue?.value}
        />
    );
}

const container = withPreloader(Container, props => props.defaultValue?.status === "loading");

const Widget = withSelectFilterAPI(container);

export default function DatagridDropdownFilter(props: DatagridDropdownFilterContainerProps): ReactElement {
    return <Widget {...props} />;
}
