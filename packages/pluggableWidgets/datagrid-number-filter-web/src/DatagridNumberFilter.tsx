import { ReactElement, createElement } from "react";
import { withPreloader } from "@mendix/widget-plugin-platform/hoc/withPreloader";
import { DatagridNumberFilterContainerProps } from "../typings/DatagridNumberFilterProps";
import { NumberFilterContainer } from "./components/NumberFilterContainer";
import { isLoadingDefaultValues } from "./utils/widget-utils";
import { withNumberFilterAPI } from "./hocs/withNumberFilterAPI";
import { withLinkedAttributes } from "./hocs/withLinkedAttributes";

const container = withPreloader<DatagridNumberFilterContainerProps>(NumberFilterContainer, isLoadingDefaultValues);
const FilterAuto = withNumberFilterAPI(container);
const FilterLinked = withLinkedAttributes(container);

export default function DatagridNumberFilter(props: DatagridNumberFilterContainerProps): ReactElement {
    const isAuto = props.attrChoice === "auto";

    if (isAuto) {
        return <FilterAuto {...props} />;
    }

    return <FilterLinked {...props} />;
}
