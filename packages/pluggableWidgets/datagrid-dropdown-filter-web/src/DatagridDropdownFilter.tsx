import { ReactElement } from "react";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
import { AttrFilter } from "./components/AttrFilter";
import { RefFilter } from "./components/RefFilter";

function Container(props: DatagridDropdownFilterContainerProps): ReactElement {
    if (props.baseType === "attr") {
        return <AttrFilter {...props} />;
    }

    return <RefFilter {...props} />;
}

const DatagridDropdownFilter = withPreloader(Container, props => props.defaultValue?.status === "loading");

export default DatagridDropdownFilter;
