import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { JSX, ReactElement, ReactNode } from "react";
import { PaginationEnum, PagingPositionEnum } from "../../typings/DatagridProps";
import { useDatagridRootScope } from "../helpers/root-context";

type WidgetFooterProps = {
    pagingPosition: PagingPositionEnum;
    pagination: ReactNode;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;
    hasMoreItems: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
} & JSX.IntrinsicElements["div"];

export function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const { pagingPosition, pagination, paginationType, loadMoreButtonCaption, hasMoreItems, setPage, ...rest } = props;
    return (
        <div {...rest} className="widget-datagrid-footer table-footer">
            <div className="widget-datagrid-paging-bottom">
                <div className="widget-datagrid-pb-start">
                    <SelectionCounter />
                </div>
                {hasMoreItems && paginationType === "loadMore" && (
                    <div className="widget-datagrid-pb-middle">
                        <button
                            className="btn btn-primary widget-datagrid-load-more"
                            onClick={() => setPage && setPage(prev => prev + 1)}
                            tabIndex={0}
                        >
                            {loadMoreButtonCaption}
                        </button>
                    </div>
                )}
                <div className="widget-datagrid-pb-end">
                    {(pagingPosition === "bottom" || pagingPosition === "both") && pagination}
                </div>
            </div>
        </div>
    );
}

const SelectionCounter = observer(function SelectionCounter() {
    const { selectionCountStore, selectActionHelper } = useDatagridRootScope();

    return (
        <If condition={selectionCountStore.selectedCountText !== ""}>
            <span className="widget-datagrid-selection-count">{selectionCountStore.selectedCountText}</span>
            &nbsp;
            <button className="widget-datagrid-btn-invisible btn" onClick={selectActionHelper.onClearSelection}>
                Clear selection
            </button>
        </If>
    );
});
