import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { SelectionAriaLive } from "../features/selection-counter/SelectionAriaLive";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { useCustomPagination, usePaginationConfig, usePaginationVM, useTexts } from "../model/hooks/injection-hooks";
import { Pagination } from "./Pagination";

export const WidgetFooter = observer(function WidgetFooter(): ReactElement | null {
    const pgConfig = usePaginationConfig();
    const paging = usePaginationVM();
    const { loadMoreButtonCaption } = useTexts();
    const selectionCounterVM = useSelectionCounterViewModel();
    const customPagination = useCustomPagination();

    const showFooter =
        selectionCounterVM.isBottomCounterVisible ||
        paging.paginationVisible ||
        paging.showVirtualScrollingWithRowCount ||
        paging.showLoadMore;

    if (!showFooter) {
        return null;
    }

    return (
        <div className="widget-datagrid-footer table-footer">
            <If condition={config.selectionEnabled}>
                <SelectionAriaLive />
            </If>
            <div className="widget-datagrid-paging-bottom">
                <div className="widget-datagrid-pb-start">
                    <If condition={selectionCounterVM.isBottomCounterVisible}>
                        <SelectionCounter />
                    </If>
                </div>
                <If condition={paging.hasMoreItems && paging.pagination === "loadMore"}>
                    <div className="widget-datagrid-pb-middle">
                        <button
                            className="btn btn-primary widget-datagrid-load-more"
                            onClick={() => paging.setPage(n => n + 1)}
                            tabIndex={0}
                        >
                            {loadMoreButtonCaption}
                        </button>
                    </div>
                </If>
                <div className="widget-datagrid-pb-end">
                    <If condition={pgConfig.pagingPosition !== "top"}>
                        <Pagination />
                    </If>
                    <If condition={pgConfig.customPaginationEnabled}>{customPagination.get()}</If>
                </div>
            </div>
        </div>
    );
});
