import {
    DerivedPropsGate,
    disposeBatch,
    SetupLifecycle,
    SetupLifecycleHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { DynamicValue } from "mendix";
import { autorun } from "mobx";
import type { QueryService } from "../interfaces";

type PaginationEnum = "buttons" | "virtualScrolling" | "loadMore" | "custom";

type ShowPagingButtonsEnum = "always" | "auto";

type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}`;

export interface PaginationConfig {
    pageSize: number;
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showTotalCount: boolean;
}

interface DynamicProps {
    dynamicPage: DynamicValue<number>;
    dynamicPageSize: DynamicValue<number>;
}

export class PaginationService implements SetupLifecycle {
    readonly pagination: PaginationEnum;
    readonly paginationKind: PaginationKind;
    readonly showPagingButtons: ShowPagingButtonsEnum;
    readonly showTotalCount: boolean;

    constructor(
        host: SetupLifecycleHost,
        private readonly gate: DerivedPropsGate<DynamicProps>,
        private readonly config: PaginationConfig,
        private readonly query: QueryService
    ) {
        host.addNode(this);
        this.pagination = config.pagination;
        this.showPagingButtons = config.showPagingButtons;
        this.showTotalCount = config.showTotalCount;
        this.paginationKind = `${this.pagination}.${this.showPagingButtons}`;
        this.setInitParams();
    }

    private setInitParams(): void {
        if (this.pagination === "buttons" || this.showTotalCount || this.pagination === "custom") {
            this.query.requestTotalCount(true);
        }

        this.query.setInitLimit(this.pageSize);
    }

    get isLimitBased(): boolean {
        return this.pagination === "virtualScrolling" || this.pagination === "loadMore";
    }

    get pageSize(): number {
        return this.config.pageSize;
    }

    get currentPage(): number {
        const {
            query: { offset },
            pageSize
        } = this;

        return this.isLimitBased ? 0 : offset / pageSize;
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
                return this.showTotalCount;
        }
    }

    get hasMoreItems(): boolean {
        return this.query.hasMoreItems;
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        if (this.pagination === "custom") {
            add(autorun(this.syncPaginationEffect()));
        }

        return disposeAll;
    }

    syncPaginationEffect(): () => void {
        return () => {
            const pageSize = this.gate.props.dynamicPageSize.value ?? this.config.pageSize;
            const page = (this.gate.props.dynamicPage.value ?? 1) - 1;
            this.query.setLimit(pageSize);
            this.query.setOffset(page * pageSize);
        };
    }

    setPage = (computePage: (prevPage: number) => number): void => {
        const newPage = computePage(this.currentPage);
        if (this.isLimitBased) {
            this.query.setLimit(newPage * this.pageSize);
        } else {
            this.query.setOffset(newPage * this.pageSize);
        }
    };
}
