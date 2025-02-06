import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue, ValueStatus } from "mendix";
import { action, autorun, makeObservable, observable } from "mobx";
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

    isLoadingMore = false;
    isLoading = true;

    constructor(host: ReactiveControllerHost, { gate }: Spec) {
        host.addController(this);
        this.gate = gate;
        this.pagination = gate.props.pagination;
        this.showPagingButtons = gate.props.showPagingButtons;
        this.showNumberOfRows = gate.props.showNumberOfRows;
        this.paginationKind = `${this.pagination}.${this.showPagingButtons}`;
        this.setInitParams();

        type PrivateMembers = "updateFlags" | "setIsLoadingMore" | "setIsLoading";
        makeObservable<this, PrivateMembers>(this, {
            isLoadingMore: observable,
            isLoading: observable,
            setIsLoadingMore: action,
            updateFlags: action,
            setIsLoading: action
        });
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

    private get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    private setInitParams(): void {
        if (this.pagination === "buttons" || this.showNumberOfRows) {
            this.datasource.requestTotalCount(true);
        }

        this.datasource.setLimit(this.pageSize);
    }

    private setIsLoadingMore(value: boolean): void {
        this.isLoadingMore = value;
    }

    private updateFlags(status: ValueStatus): void {
        if (this.isLoadingMore) {
            this.setIsLoadingMore(status === "loading");
        } else if (this.isLoading) {
            this.setIsLoading(status === "loading");
        }
    }

    private setIsLoading(value: boolean): void {
        this.isLoading = value;
    }

    setup(): () => void {
        // Always use actions to set flags to avoid subscribing to them
        return autorun(() => this.updateFlags(this.datasource.status));
    }

    setPage = (computePage: (prevPage: number) => number): void => {
        const newPage = computePage(this.currentPage);
        if (this.isLimitBased) {
            this.datasource.setLimit(newPage * this.pageSize);
            this.setIsLoadingMore(true);
        } else {
            this.datasource.setOffset(newPage * this.pageSize);
            this.setIsLoading(true);
        }
    };
}
