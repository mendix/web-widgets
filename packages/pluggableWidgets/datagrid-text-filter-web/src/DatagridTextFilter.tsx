import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { createElement, ReactElement } from "react";
import { DatagridTextFilterContainerProps } from "../typings/DatagridTextFilterProps";
import { TextFilterContainer } from "./components/TextFilterContainer";
import { withTextFilterAPI } from "./hocs/withTextFilterAPI";
import { isLoadingDefaultValues } from "./utils/widget-utils";
import { withLinkedAttributes } from "./hocs/withLinkedAttributes";

const container = withPreloader<DatagridTextFilterContainerProps>(TextFilterContainer, isLoadingDefaultValues);
const FilterAuto = withTextFilterAPI(container);
const FilterLinked = withLinkedAttributes(container);

export default function DatagridTextFilter(props: DatagridTextFilterContainerProps): ReactElement {
    const isAuto = props.attrChoice === "auto";

    if (isAuto) {
        return <FilterAuto {...props} />;
    }

    return <FilterLinked {...props} />;
}
