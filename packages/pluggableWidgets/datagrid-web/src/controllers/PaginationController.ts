import { QueryController } from "@mendix/widget-plugin-grid/query/query-controller";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../typings/DatagridProps";

export interface PaginationConfig {
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    pageSize: number;
}

type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}`;

export class PaginationController implements ReactiveController {
    readonly pagination: PaginationEnum;
    readonly paginationKind: PaginationKind;

    constructor(
        host: ReactiveControllerHost,
        private readonly config: PaginationConfig,
        private query: QueryController
    ) {
        host.addController(this);
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

        this.query.setPageSize(this.pageSize);
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
