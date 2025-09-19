import { createElement, ReactElement, ReactNode } from "react";
import { PaginationEnum, SelectionCountVisibilityEnum } from "../../typings/DatagridProps";
import { SelectionCounter } from "./SelectionCounter";

type WidgetFooterProps = {
    pagination: ReactNode;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;
    clearSelectionButtonLabel?: string;
    selectionCountVisibility?: SelectionCountVisibilityEnum;
    hasMoreItems: boolean;
    showFooter: boolean;
    selectedCount: number;
    setPage?: (computePage: (prevPage: number) => number) => void;
} & JSX.IntrinsicElements["div"];

export function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const {
        pagination,
        paginationType,
        loadMoreButtonCaption,
        clearSelectionButtonLabel,
        selectionCountVisibility,
        hasMoreItems,
        setPage,
        showFooter,
        selectedCount,
        ...rest
    } = props;

    return (
        <div {...rest} className="widget-datagrid-footer table-footer">
            <div className="widget-datagrid-paging-bottom">
                {selectionCountVisibility === "bottom" && selectedCount > 0 && (
                    <div className="widget-datagrid-pb-start">
                        <SelectionCounter clearSelectionButtonLabel={clearSelectionButtonLabel} />
                    </div>
                )}
                <div className="widget-datagrid-pb-end">
                    {showFooter && pagination}
                    {hasMoreItems && paginationType === "loadMore" && (
                        <button
                            className="btn btn-primary widget-datagrid-load-more"
                            onClick={() => setPage && setPage(prev => prev + 1)}
                            tabIndex={0}
                        >
                            {loadMoreButtonCaption}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
