import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue } from "mendix";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../typings/DatagridProps";

type Gate = DerivedPropsGate<{
    datasource: ListValue;
    pageSize: number;
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
}>;

type Spec = {
    gate: Gate;
};

type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}`;

export class PaginationController implements ReactiveController {
    private gate: Gate;

    readonly pagination: PaginationEnum;
    readonly paginationKind: PaginationKind;
    readonly showPagingButtons: ShowPagingButtonsEnum;
    readonly showNumberOfRows: boolean;
    setup = undefined;

    constructor(host: ReactiveControllerHost, { gate }: Spec) {
        host.addController(this);
        this.gate = gate;
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
            datasource: { limit, offset },
            pageSize
        } = this;
        return this.isLimitBased ? limit / pageSize : offset / pageSize;
    }

    private get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    private setInitParams(): void {
        if (this.pagination === "buttons" || this.showNumberOfRows) {
            this.datasource.requestTotalCount(true);
        }

        this.datasource.setLimit(this.pageSize);
    }

    get showPagination(): boolean {
        switch (this.paginationKind) {
            case "buttons.always":
                return true;
            case "buttons.auto": {
                const { totalCount = -1 } = this.datasource;
                return totalCount > this.datasource.limit;
            }
            default:
                return this.showNumberOfRows;
        }
    }

    setPage = (computePage: (prevPage: number) => number): void => {
        const newPage = computePage(this.currentPage);
        if (this.isLimitBased) {
            this.datasource.setLimit(newPage * this.pageSize);
        } else {
            this.datasource.setOffset(newPage * this.pageSize);
        }
    };
}
