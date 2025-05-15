import { createElement, ReactElement } from "react";
import { withLinkedRefStore } from "../hocs/withLinkedRefStore";
import { RefFilterContainer } from "@mendix/widget-plugin-dropdown-filter/containers/RefFilterContainer";
import { RefFilterProps } from "./typings";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";

function Connector(props: DatagridDropdownFilterContainerProps & RefFilterProps): ReactElement {
    return (
        <RefFilterContainer
            {...props}
            multiselect={props.multiSelect}
            ariaLabel={props.ariaLabel?.value}
            className={props.class}
            styles={props.style}
            emptyCaption={props.emptyOptionCaption?.value}
            defaultValue={props.defaultValue?.value}
            parentChannelName={props.parentChannelName}
        />
    );
}

export const RefFilter = withLinkedRefStore(Connector);
