import { QueryService, SetPageAction } from "@mendix/widget-plugin-grid/main";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed, makeObservable } from "mobx";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../../typings/DatagridProps";
import { PaginationConfig } from "./pagination.config";

export class PaginationViewModel {
    readonly pagination: PaginationEnum;
    readonly showPagingButtons: ShowPagingButtonsEnum;

    constructor(
        private config: PaginationConfig,
        private query: QueryService,
        private currentPageAtom: ComputedAtom<number>,
        private pageSizeAtom: ComputedAtom<number>,
        private setPageAction: SetPageAction
    ) {
        this.pagination = config.pagination;
        this.showPagingButtons = config.showPagingButtons;

        makeObservable(this, {
            pageSize: computed,
            currentPage: computed,
            paginationVisible: computed,
            showLoadMore: computed,
            showVirtualScrollingWithRowCount: computed,
            hasMoreItems: computed,
            totalCount: computed
        });
    }

    get pageSize(): number {
        return this.pageSizeAtom.get();
    }

    get currentPage(): number {
        return this.currentPageAtom.get();
    }

    get paginationVisible(): boolean {
        switch (this.config.paginationKind) {
            case "buttons.always":
                return true;
            case "buttons.auto": {
                const { totalCount = -1 } = this.query;
                return totalCount > this.query.limit;
            }
            case "custom": {
                return false;
            }
            default:
                return this.config.showNumberOfRows;
        }
    }

    get showLoadMore(): boolean {
        return this.hasMoreItems && this.pagination === "loadMore";
    }

    get showVirtualScrollingWithRowCount(): boolean {
        return this.pagination === "virtualScrolling" && this.config.showNumberOfRows;
    }

    get hasMoreItems(): boolean {
        return this.query.hasMoreItems;
    }

    get totalCount(): number | undefined {
        return this.query.totalCount;
    }

    setPage: SetPageAction = value => {
        this.setPageAction(value);
    };
}
