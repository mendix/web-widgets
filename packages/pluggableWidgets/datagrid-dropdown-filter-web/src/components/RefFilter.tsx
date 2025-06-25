import { RefFilterContainer } from "@mendix/widget-plugin-dropdown-filter/containers/RefFilterContainer";
import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import { withAttrGuard } from "../hocs/withAttrGuard";
import { withLinkedRefStore } from "../hocs/withLinkedRefStore";
import { RefFilterProps } from "./typings";

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

export const RefFilter = withAttrGuard(withLinkedRefStore(Connector));
