import { Pagination as PaginationComponent } from "@mendix/widget-plugin-grid/components/Pagination";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { usePaginationVM } from "../model/hooks/injection-hooks";

export const Pagination = observer(function Pagination(): ReactNode {
    const paging = usePaginationVM();

    if (!paging.paginationVisible) return null;

    return (
        <PaginationComponent
            canNextPage={paging.hasMoreItems}
            canPreviousPage={paging.currentPage !== 0}
            gotoPage={page => paging.setPage(page)}
            nextPage={() => paging.setPage(n => n + 1)}
            numberOfItems={paging.totalCount}
            page={paging.currentPage}
            pageSize={paging.pageSize}
            showPagingButtons={paging.showPagingButtons}
            previousPage={() => paging.setPage(n => n - 1)}
            pagination={paging.pagination}
        />
    );
});
