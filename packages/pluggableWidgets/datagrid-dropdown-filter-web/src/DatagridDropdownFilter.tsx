import { createElement, ReactElement } from "react";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
import { AttrFilter } from "./components/AttrFilter";

// function Container(props: DatagridDropdownFilterContainerProps & Select_FilterAPIv2): React.ReactElement {
//     const commonProps = {
//         ariaLabel: props.ariaLabel?.value,
//         className: props.class,
//         tabIndex: props.tabIndex,
//         styles: props.style,
//         onChange: props.onChange,
//         valueAttribute: props.valueAttribute,
//         parentChannelName: props.parentChannelName,
//         name: props.name,
//         multiselect: props.multiSelect,
//         emptyCaption: props.emptyOptionCaption?.value,
//         defaultValue: props.defaultValue?.value,
//         filterable: props.filterable,
//         selectionMethod: props.selectionMethod,
//         selectedItemsStyle: props.selectedItemsStyle,
//         clearable: props.clearable
//     };

//     if (props.filterStore.storeType === "refselect") {
//         return <RefFilterContainer {...commonProps} filterStore={props.filterStore} />;
//     }

//     return (
//         <StaticFilterContainer {...commonProps} filterStore={props.filterStore} filterOptions={props.filterOptions} />
//     );
// }

const DatagridDropdownFilter = withPreloader(Container, props => props.defaultValue?.status === "loading");

export default DatagridDropdownFilter;

function Container(props: DatagridDropdownFilterContainerProps): ReactElement {
    if (props.baseType === "attr") {
        return <AttrFilter {...props} />;
    }

    return <RefFilter {...props} />;
}

function RefFilter(props: DatagridDropdownFilterContainerProps): ReactElement {
    return <div key={props.name} />;
}
