import { ReactElement, createElement } from "react";
import { StaticFilterContainer } from "@mendix/widget-plugin-dropdown-filter/containers/StaticFilterContainer";
import { withFilterAPI } from "@mendix/widget-plugin-filtering/helpers/withFilterAPI";
import { withParentProvidedEnumStore } from "../hocs/withParentProvidedEnumStore";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import { withLinkedEnumStore } from "../hocs/withLinkedEnumStore";
import { EnumFilterProps } from "./typings";

export function AttrFilter(props: DatagridDropdownFilterContainerProps): ReactElement {
    if (props.attrChoice === "auto") {
        return <AutoAttrFilter {...props} />;
    }

    return <LinkedAttrFilter {...props} />;
}

const AutoAttrFilter = withParentProvidedEnumStore(Connector);

const LinkedAttrFilter = withFilterAPI(withLinkedEnumStore(Connector));

function Connector(props: DatagridDropdownFilterContainerProps & EnumFilterProps): ReactElement {
    return (
        <StaticFilterContainer
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
