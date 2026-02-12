import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed, makeObservable } from "mobx";
import { QueryService } from "../interfaces/QueryService";
import { SetPageAction } from "./pagination.model";

type PaginationEnum = "buttons" | "virtualScrolling" | "loadMore";

type ShowPagingButtonsEnum = "always" | "auto";

export type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}` | "custom";

export class PaginationViewModel {
    readonly pagination: PaginationEnum;
    readonly showPagingButtons: ShowPagingButtonsEnum;

    constructor(
        private config: {
            pagination: PaginationEnum;
            paginationKind: PaginationKind;
            showPagingButtons: ShowPagingButtonsEnum;
            // Gallery
            showNumberOfItems?: boolean;
            // Datagrid
            showNumberOfRows?: boolean;
        },
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
                return this.config.showNumberOfItems || this.config.showNumberOfRows || false;
        }
    }

    get loadMoreVisible(): boolean {
        return this.pagination === "loadMore" && this.hasMoreItems;
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
