import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../typings/DatagridProps";
import { QueryController } from "./query-controller";

type Gate = DerivedPropsGate<{
    pageSize: number;
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
}>;

type PaginationControllerSpec = {
    gate: Gate;
    query: QueryController;
};

type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}`;

export class PaginationController implements ReactiveController {
    private gate: Gate;
    private query: QueryController;
    readonly pagination: PaginationEnum;
    readonly paginationKind: PaginationKind;
    readonly showPagingButtons: ShowPagingButtonsEnum;
    readonly showNumberOfRows: boolean;

    constructor(host: ReactiveControllerHost, { gate, query }: PaginationControllerSpec) {
        host.addController(this);
        this.gate = gate;
        this.query = query;
        this.pagination = gate.props.pagination;
        this.showPagingButtons = gate.props.showPagingButtons;
        this.showNumberOfRows = gate.props.showNumberOfRows;
        this.paginationKind = `${this.pagination}.${this.showPagingButtons}`;
        this.setInitParams();
    }

    get isLimitBased(): boolean {
        return this.pagination === "virtualScrolling" || this.pagination === "loadMore";
    }

    get pageSize(): number {
        return this.gate.props.pageSize;
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
                return this.showNumberOfRows;
        }
    }

    private setInitParams(): void {
        if (this.pagination === "buttons" || this.showNumberOfRows) {
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
