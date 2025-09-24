import { withAttributeGuard } from "@mendix/widget-plugin-filtering/helpers/withAttributeGuard";
import { withFilterAPI } from "@mendix/widget-plugin-filtering/helpers/withFilterAPI";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { ReactElement } from "react";
import { DatagridDateFilterContainerProps } from "../typings/DatagridDateFilterProps";
import { DateFilterContainer } from "./components/DateFilterContainer";
import { withLinkedDateStore } from "./hocs/withLinkedDateStore";
import { withParentProvidedDateStore } from "./hocs/withParentProvidedDateStore";
import { isLoadingDefaultValues } from "./utils/widget-utils";

const Container = withPreloader(DateFilterContainer, isLoadingDefaultValues);

const FilterAuto = withParentProvidedDateStore(Container);

const FilterLinked = withAttributeGuard(withFilterAPI(withLinkedDateStore(Container)));

export default function DatagridDateFilter(props: DatagridDateFilterContainerProps): ReactElement | null {
    if (props.attrChoice === "auto") {
        return <FilterAuto {...props} />;
    }

    return <FilterLinked {...props} />;
}
