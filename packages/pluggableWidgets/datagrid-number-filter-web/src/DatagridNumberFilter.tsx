import { withAttributeGuard } from "@mendix/widget-plugin-filtering/helpers/withAttributeGuard";
import { withFilterAPI } from "@mendix/widget-plugin-filtering/helpers/withFilterAPI";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { createElement, ReactElement } from "react";
import { DatagridNumberFilterContainerProps } from "../typings/DatagridNumberFilterProps";
import { NumberFilterContainer } from "./components/NumberFilterContainer";
import { withLinkedNumberStore } from "./hocs/withLinkedNumberStore";
import { withParentProvidedNumberStore } from "./hocs/withParentProvidedNumberStore";
import { isLoadingDefaultValues } from "./utils/widget-utils";

const Container = withPreloader<DatagridNumberFilterContainerProps>(NumberFilterContainer, isLoadingDefaultValues);

const FilterAuto = withParentProvidedNumberStore(Container);

const FilterLinked = withAttributeGuard(withFilterAPI(withLinkedNumberStore(Container)));

export default function DatagridNumberFilter(props: DatagridNumberFilterContainerProps): ReactElement {
    if (props.attrChoice === "auto") {
        return <FilterAuto {...props} />;
    }

    return <FilterLinked {...props} />;
}
