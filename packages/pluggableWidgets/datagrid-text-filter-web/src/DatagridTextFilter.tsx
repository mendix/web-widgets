import { withAttributeGuard } from "@mendix/widget-plugin-filtering/helpers/withAttributeGuard";
import { withFilterAPI } from "@mendix/widget-plugin-filtering/helpers/withFilterAPI";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { createElement, ReactElement } from "react";
import { DatagridTextFilterContainerProps } from "../typings/DatagridTextFilterProps";
import { TextFilterContainer } from "./components/TextFilterContainer";
import { withLinkedStringStore } from "./hocs/withLinkedStringStore";
import { withParentProvidedStringStore } from "./hocs/withParentProvidedStringStore";
import { isLoadingDefaultValues } from "./utils/widget-utils";

const Container = withPreloader<DatagridTextFilterContainerProps>(TextFilterContainer, isLoadingDefaultValues);

const FilterAuto = withParentProvidedStringStore(Container);

const FilterLinked = withAttributeGuard(withFilterAPI(withLinkedStringStore(Container)));

export default function DatagridTextFilter(props: DatagridTextFilterContainerProps): ReactElement {
    console.log("props datagrid text filter ", props);
    if (props.attrChoice === "auto") {
        return <FilterAuto {...props} />;
    }

    return <FilterLinked {...props} />;
}
