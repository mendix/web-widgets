import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue, ValueStatus } from "mendix";
import { action, autorun, makeAutoObservable } from "mobx";
import { QueryController } from "./query-controller";

type Gate = DerivedPropsGate<{ datasource: ListValue }>;
type DatasourceControllerSpec = { gate: Gate };

export class DatasourceController implements ReactiveController, QueryController {
    private gate: Gate;
    private refreshing = false;
    private fetching = false;
    private pageSize = Infinity;

    constructor(host: ReactiveControllerHost, spec: DatasourceControllerSpec) {
        host.addController(this);
        this.gate = spec.gate;

        type PrivateMembers = "resetFlags" | "updateFlags" | "setRefreshing" | "setFetching" | "pageSize";
        makeAutoObservable<this, PrivateMembers>(this, {
            setup: false,
            pageSize: false,
            updateFlags: action,
            resetFlags: action,
            setRefreshing: action,
            setFetching: action
        });
    }

    private resetFlags(): void {
        this.refreshing = false;
        this.fetching = false;
    }

    private updateFlags(status: ValueStatus): void {
        if (this.refreshing) {
            this.setRefreshing(status === "loading");
        }
        if (this.fetching) {
            this.setFetching(status === "loading");
        }
    }

    private setRefreshing(value: boolean): void {
        this.refreshing = value;
    }

    private setFetching(value: boolean): void {
        this.fetching = value;
    }

    private resetLimit(): void {
        this.datasource.setLimit(this.pageSize);
    }

    private get isDSLoading(): boolean {
        return this.datasource.status === "loading";
    }

    private get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    get isLoading(): boolean {
        if (this.isRefreshing || this.isFetchingNextBatch) {
            return false;
        }
        return this.isDSLoading;
    }

    get isRefreshing(): boolean {
        return this.refreshing;
    }

    get isFetchingNextBatch(): boolean {
        return this.fetching;
    }

    get limit(): number {
        return this.datasource.limit;
    }

    get offset(): number {
        return this.datasource.offset;
    }

    get totalCount(): number | undefined {
        return this.datasource.totalCount;
    }

    /**
     * Returns a new copy of the controller.
     * Recomputes the copy every time the datasource changes.
     */
    get computedCopy(): DatasourceController {
        const [copy] = [this.datasource].map(() => Object.create(this));
        return copy;
    }

    setup(): () => void {
        return autorun(() => {
            // Always use actions to set flags to avoid subscribing to them
            this.updateFlags(this.datasource.status);
        });
    }

    refresh(): void {
        if (this.isDSLoading) {
            return;
        }
        this.setRefreshing(true);
        this.datasource.reload();
    }

    requestTotalCount(needTotal: boolean): void {
        this.datasource.requestTotalCount(needTotal);
    }

    setLimit(limit: number): void {
        this.setFetching(true);
        this.datasource.setLimit(limit);
    }

    setOffset(offset: number): void {
        this.resetFlags();
        this.resetLimit();
        this.datasource.setOffset(offset);
    }

    setSortOrder(...params: Parameters<ListValue["setSortOrder"]>): void {
        this.resetFlags();
        this.resetLimit();
        this.datasource.setSortOrder(...params);
    }

    setFilter(...params: Parameters<ListValue["setFilter"]>): void {
        this.resetFlags();
        this.resetLimit();
        this.datasource.setFilter(...params);
    }

    setPageSize(size: number): void {
        this.pageSize = size;
    }
}
