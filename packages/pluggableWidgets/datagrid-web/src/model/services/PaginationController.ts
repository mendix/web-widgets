import { QueryService } from "@mendix/widget-plugin-grid/main";
import { SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../../typings/DatagridProps";

export interface PaginationConfig {
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    pageSize: number;
}

type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}`;

export class PaginationController implements SetupComponent {
    readonly pagination: PaginationEnum;
    readonly paginationKind: PaginationKind;

    constructor(
        host: SetupComponentHost,
        private config: PaginationConfig,
        private query: QueryService
    ) {
        host.add(this);
        this.pagination = config.pagination;
        this.paginationKind = `${this.pagination}.${config.showPagingButtons}`;
        this.setInitParams();
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

    get showPagination(): boolean {
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

    private setInitParams(): void {
        if (this.pagination === "buttons" || this.config.showNumberOfRows) {
            this.query.requestTotalCount(true);
        }

        this.query.setBaseLimit(this.pageSize);
    }

    setup(): void {}

    setPage = (computePage: (prevPage: number) => number): void => {
        const newPage = computePage(this.currentPage);
        if (this.isLimitBased) {
            this.query.setLimit(newPage * this.pageSize);
        } else {
            this.query.setOffset(newPage * this.pageSize);
        }
    };
}
