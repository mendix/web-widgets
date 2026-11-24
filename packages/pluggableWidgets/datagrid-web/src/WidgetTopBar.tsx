import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { If } from "@mendix/widget-plugin-component-kit/If";
import { Pagination } from "./features/pagination/Pagination";
import { useCustomPagination, usePaginationConfig } from "./features/pagination/tokens";
import { SelectionCounter } from "./features/selection/counter/SelectionCounter";
import { useSelectionCounterViewModel } from "./features/selection/tokens";

export const WidgetTopBar = observer(function WidgetTopBar(): ReactElement {
    const pgConfig = usePaginationConfig();
    const selectionCounter = useSelectionCounterViewModel();
    const customPagination = useCustomPagination();

    return (
        <div className="widget-datagrid-top-bar table-header">
            <div className="widget-datagrid-paging-top">
                <div className="widget-datagrid-tb-start">
                    <If condition={selectionCounter.isTopCounterVisible}>
                        <SelectionCounter />
                    </If>
                </div>
                <div className="widget-datagrid-tb-end">
                    <If condition={!pgConfig.customPaginationEnabled && pgConfig.pagingPosition !== "bottom"}>
                        <Pagination />
                    </If>
                    <If condition={pgConfig.customPaginationEnabled && pgConfig.pagingPosition === "top"}>
                        {customPagination.get()}
                    </If>
                </div>
            </div>
        </div>
    );
});
