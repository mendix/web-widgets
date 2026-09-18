import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Pagination as PaginationComponent } from "@mendix/widget-plugin-grid/components/Pagination";
import { usePaginationVM, useTexts } from "../model/hooks/injection-hooks";

export const Pagination = observer(function Pagination(): ReactNode {
    const paging = usePaginationVM();
    const texts = useTexts();

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
            labelPagination={texts.get("paginationAriaLabel")}
            labelFirstPage={texts.get("goToFirstPageAriaLabel")}
            labelPreviousPage={texts.get("goToPreviousPageAriaLabel")}
            labelNextPage={texts.get("goToNextPageAriaLabel")}
            labelLastPage={texts.get("goToLastPageAriaLabel")}
            labelPagingStatus={texts.get("pagingStatusAriaLabel")}
            labelPagingStatusWithRange={(first, last, total) =>
                texts.get("pagingStatusRangeWithTotal", [String(first), String(last), String(total)])
            }
            labelPagingStatusRange={(first, last) => texts.get("pagingStatusRange", [String(first), String(last)])}
            labelPagingStatusWithTotal={(loaded, total) =>
                texts.get("pagingStatusCountWithTotal", [String(loaded), String(total)])
            }
            labelPagingStatusCount={loaded => texts.get("pagingStatusCount", [String(loaded)])}
        />
    );
});
