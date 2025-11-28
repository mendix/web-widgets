import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { useDatagridConfig, usePaginationService, useTexts } from "../model/hooks/injection-hooks";
import { Pagination } from "./Pagination";

export const WidgetFooter = observer(function WidgetFooter(): ReactElement {
    const config = useDatagridConfig();
    const paging = usePaginationService();
    const { loadMoreButtonCaption } = useTexts();
    const selectionCounterVM = useSelectionCounterViewModel();

    return (
        <div className="widget-datagrid-footer table-footer">
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
                    <If condition={config.pagingPosition !== "top"}>
                        <Pagination />
                    </If>
                </div>
            </div>
        </div>
    );
});
