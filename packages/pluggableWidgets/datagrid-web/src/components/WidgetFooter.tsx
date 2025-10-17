import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { PaginationEnum } from "../../typings/DatagridProps";

type WidgetFooterProps = {
    pagination: ReactNode;
    selectionCount: ReactNode;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;
    hasMoreItems: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
} & ComponentPropsWithoutRef<"div">;

export function WidgetFooter(props: WidgetFooterProps): ReactElement | null {
    const { pagination, selectionCount, paginationType, loadMoreButtonCaption, hasMoreItems, setPage, ...rest } = props;

    return (
        <div {...rest} className="widget-datagrid-footer table-footer">
            <div className="widget-datagrid-paging-bottom">
                {selectionCount}
                <div className="widget-datagrid-pb-end">
                    {pagination}
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
