import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { QueryController } from "./query-controller";

type PaginationEnum = "buttons" | "virtualScrolling" | "loadMore";

type ShowPagingButtonsEnum = "always" | "auto";

type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}`;

interface StaticProps {
    pageSize: number;
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showTotalCount: boolean;
}

/** NOTE: Use gate for dynamic props */
type PaginationControllerSpec = StaticProps & {
    query: QueryController;
};

export class PaginationController implements ReactiveController {
    private readonly _pageSize: number;
    private readonly _query: QueryController;
    readonly pagination: PaginationEnum;
    readonly paginationKind: PaginationKind;
    readonly showPagingButtons: ShowPagingButtonsEnum;
    readonly showTotalCount: boolean;

    constructor(host: ReactiveControllerHost, spec: PaginationControllerSpec) {
        host.addController(this);
        this._pageSize = spec.pageSize;
        this._query = spec.query;
        this.pagination = spec.pagination;
        this.showPagingButtons = spec.showPagingButtons;
        this.showTotalCount = spec.showTotalCount;
        this.paginationKind = `${this.pagination}.${this.showPagingButtons}`;
        this._setInitParams();
    }

    get isLimitBased(): boolean {
        return this.pagination === "virtualScrolling" || this.pagination === "loadMore";
    }

    get pageSize(): number {
        return this._pageSize;
    }

    get currentPage(): number {
        const {
            _query: { limit, offset },
            pageSize
        } = this;
        return this.isLimitBased ? limit / pageSize : offset / pageSize;
    }

    get showPagination(): boolean {
        switch (this.paginationKind) {
            case "buttons.always":
                return true;
            case "buttons.auto": {
                const { totalCount = -1 } = this._query;
                return totalCount > this._query.limit;
            }
            default:
                return this.showTotalCount;
        }
    }

    get hasMoreItems(): boolean {
        return this._query.hasMoreItems;
    }

    private _setInitParams(): void {
        if (this.pagination === "buttons" || this.showTotalCount) {
            this._query.requestTotalCount(true);
        }

        this._query.setPageSize(this.pageSize);
    }

    setup(): void {}

    setPage = (computePage: (prevPage: number) => number): void => {
        const newPage = computePage(this.currentPage);
        if (this.isLimitBased) {
            this._query.setLimit(newPage * this.pageSize);
        } else {
            this._query.setOffset(newPage * this.pageSize);
        }
    };
}
