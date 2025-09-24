import { RefFilterContainer } from "@mendix/widget-plugin-dropdown-filter/containers/RefFilterContainer";
import { ReactElement } from "react";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import { withAttrGuard } from "../hocs/withAttrGuard";
import { withLinkedRefStore } from "../hocs/withLinkedRefStore";
import { RefFilterProps } from "./typings";

function Connector(props: DatagridDropdownFilterContainerProps & RefFilterProps): ReactElement {
    return (
        <RefFilterContainer
            {...props}
            multiselect={props.multiSelect}
            ariaLabel={props.ariaLabel?.value ?? ""}
            className={props.class}
            styles={props.style}
            emptyOptionCaption={props.emptyOptionCaption?.value ?? ""}
            emptySelectionCaption={props.emptySelectionCaption?.value ?? ""}
            placeholder={props.filterInputPlaceholderCaption?.value ?? ""}
            defaultValue={props.defaultValue?.value}
            parentChannelName={props.parentChannelName}
        />
    );
}

export const RefFilter = withAttrGuard(withLinkedRefStore(Connector));
