import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { createElement, ReactElement } from "react";
import { DatagridDateFilterContainerProps } from "../typings/DatagridDateFilterProps";
import { Container } from "./components/DateFilterContainer";
import { withDateFilterAPI } from "./hocs/withDateFilterAPI";
import { isLoadingDefaultValues } from "./utils/widget-utils";
import { withDateLinkedAttributes } from "./hocs/withDateLinkedAttributes";

const container = withPreloader(Container, isLoadingDefaultValues);
const FilterAuto = withDateFilterAPI(container);
const FilterLinked = withDateLinkedAttributes(container);

export default function DatagridDateFilter(props: DatagridDateFilterContainerProps): ReactElement | null {
    const isAuto = props.attrChoice === "auto";

    if (isAuto) {
        return <FilterAuto {...props} />;
    }

    return <FilterLinked {...props} />;
}
