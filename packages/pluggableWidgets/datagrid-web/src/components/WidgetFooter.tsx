import { createElement, ReactElement, ReactNode } from "react";
import { PaginationEnum, PagingPositionEnum, SelectionCountVisibilityEnum } from "../../typings/DatagridProps";
import { SelectionCounter } from "./SelectionCounter";

type WidgetFooterProps = {
    pagingPosition: PagingPositionEnum;
    pagination: ReactNode;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;
    clearSelectionButtonLabel?: string;
    selectionCountVisibility?: SelectionCountVisibilityEnum;
    hasMoreItems: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
} & JSX.IntrinsicElements["div"];

export function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const {
        pagingPosition,
        pagination,
        paginationType,
        loadMoreButtonCaption,
        clearSelectionButtonLabel,
        selectionCountVisibility,
        hasMoreItems,
        setPage,
        ...rest
    } = props;

    return (
        <div {...rest} className="widget-datagrid-footer table-footer">
            <div className="widget-datagrid-paging-bottom">
                <div className="widget-datagrid-pb-start">
                    {selectionCountVisibility === "bottom" && (
                        <SelectionCounter clearSelectionButtonLabel={clearSelectionButtonLabel} />
                    )}
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
