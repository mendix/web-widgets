import { ReactElement, createElement } from "react";
import {
    StaticFilterContainer,
    StaticFilterContainerProps
} from "@mendix/widget-plugin-dropdown-filter/containers/StaticFilterContainer";
import {
    withParentProvidedStore,
    Select_FilterAPIv2
} from "@mendix/widget-plugin-filtering/hocs/withParentProvidedStore";

import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";

export function AttrFilter(props: DatagridDropdownFilterContainerProps): ReactElement {
    return <AutoAttrFilter {...props} />;
}

const AutoAttrFilter = withParentProvidedStore(function AutoAttrFilter(
    props: DatagridDropdownFilterContainerProps & Select_FilterAPIv2
): ReactElement {
    return <StaticFilterContainer {...mapProps(props)} />;
});

function mapProps(props: DatagridDropdownFilterContainerProps & Select_FilterAPIv2): StaticFilterContainerProps {
    return {
        ...props,
        multiselect: props.multiSelect,
        ariaLabel: props.ariaLabel?.value,
        className: props.class,
        styles: props.style,
        emptyCaption: props.emptyOptionCaption?.value,
        defaultValue: props.defaultValue?.value,
        parentChannelName: props.parentChannelName
    };
}
