import { QueryService } from "@mendix/widget-plugin-grid/main";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../../typings/DatagridProps";

export interface PaginationConfig {
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    pageSize: number;
}

type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}`;

export class PaginationService {
    readonly pagination: PaginationEnum;
    readonly paginationKind: PaginationKind;
    readonly showPagingButtons: ShowPagingButtonsEnum;

    constructor(
        private config: PaginationConfig,
        private query: QueryService
    ) {
        this.pagination = config.pagination;
        this.paginationKind = `${this.pagination}.${config.showPagingButtons}`;
        this.showPagingButtons = config.showPagingButtons;
    }

    get isLimitBased(): boolean {
        return this.pagination === "virtualScrolling" || this.pagination === "loadMore";
    }

    get pageSize(): number {
        return this.config.pageSize;
    }

    get currentPage(): number {
        const {
            query: { limit, offset },
            pageSize
        } = this;
        return this.isLimitBased ? limit / pageSize : offset / pageSize;
    }

    get paginationVisible(): boolean {
        switch (this.paginationKind) {
            case "buttons.always":
                return true;
            case "buttons.auto": {
                const { totalCount = -1 } = this.query;
                return totalCount > this.query.limit;
            }
            default:
                return this.config.showNumberOfRows;
        }
    }

    get hasMoreItems(): boolean {
        return this.query.hasMoreItems;
    }

    get totalCount(): number | undefined {
        return this.query.totalCount;
    }

    setPage = (computePage: ((prevPage: number) => number) | number): void => {
        const newPage = typeof computePage === "function" ? computePage(this.currentPage) : computePage;
        if (this.isLimitBased) {
            this.query.setLimit(newPage * this.pageSize);
        } else {
            this.query.setOffset(newPage * this.pageSize);
        }
    };
}
