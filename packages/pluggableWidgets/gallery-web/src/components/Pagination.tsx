import { Pagination as PaginationComponent } from "@mendix/widget-plugin-grid/components/Pagination";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { usePaginationVM } from "../model/hooks/injection-hooks";

export const Pagination = observer(function Pagination(): ReactNode {
    const paginationVM = usePaginationVM();

    if (!paginationVM.paginationVisible) return null;

    return (
        <PaginationComponent
            canNextPage={paginationVM.hasMoreItems}
            canPreviousPage={paginationVM.currentPage > 0}
            gotoPage={page => paginationVM.setPage(page)}
            nextPage={() => paginationVM.setPage(n => n + 1)}
            numberOfItems={paginationVM.totalCount}
            page={paginationVM.currentPage}
            pageSize={paginationVM.pageSize}
            showPagingButtons={paginationVM.showPagingButtons}
            previousPage={() => paginationVM.setPage(n => n - 1)}
            pagination={paginationVM.pagination}
        />
    );
});
