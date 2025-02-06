import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue, ValueStatus } from "mendix";
import { action, autorun, makeAutoObservable } from "mobx";
import { QueryController } from "./query-controller";

type Gate = DerivedPropsGate<{ datasource: ListValue }>;
type Spec = { gate: Gate };

export class DatasourceController implements ReactiveController, QueryController {
    private gate: Gate;
    private refreshing = false;
    private loadingMore = false;

    constructor(host: ReactiveControllerHost, spec: Spec) {
        host.addController(this);
        this.gate = spec.gate;

        type PrivateMembers = "resetFlags" | "updateFlags" | "setRefreshing" | "setLoadingMore";
        makeAutoObservable<this, PrivateMembers>(this, {
            setup: false,
            updateFlags: action,
            resetFlags: action,
            setRefreshing: action,
            setLoadingMore: action
        });

        autorun(() => {
            const data = [
                {
                    isLoading: this.isLoading,
                    isRefreshing: this.isRefreshing,
                    isLoadingMore: this.isLoadingMore,
                    status: this.datasource.status,
                    size: this.datasource.items?.length ?? "N/A"
                }
            ];
            console.table(data);
        });
    }

    private get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    private resetFlags(): void {
        this.refreshing = false;
        this.loadingMore = false;
    }

    private updateFlags(status: ValueStatus): void {
        if (this.refreshing) {
            this.setRefreshing(status === "loading");
        }
        if (this.loadingMore) {
            this.setLoadingMore(status === "loading");
        }
    }

    private setRefreshing(value: boolean): void {
        this.refreshing = value;
    }

    private setLoadingMore(value: boolean): void {
        this.loadingMore = value;
    }

    private get isDSLoading(): boolean {
        return this.datasource.status === "loading";
    }

    get isLoading(): boolean {
        if (this.isRefreshing || this.isLoadingMore) {
            return false;
        }
        return this.isDSLoading;
    }

    get isRefreshing(): boolean {
        return this.isDSLoading && this.refreshing;
    }

    get isLoadingMore(): boolean {
        return this.isDSLoading && this.loadingMore;
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

    get observableCopy(): DatasourceController {
        // Subscribe to the datasource to make sure we have new copy when it changes
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

    setLimit(limit: number, options: { loadingMore?: boolean } = {}): void {
        const { loadingMore = true } = options;
        this.setLoadingMore(loadingMore);
        this.datasource.setLimit(limit);
    }

    setOffset(offset: number): void {
        this.resetFlags();
        this.datasource.setOffset(offset);
    }

    setSortOrder(...params: Parameters<ListValue["setSortOrder"]>): void {
        this.resetFlags();
        this.datasource.setSortOrder(...params);
    }

    setFilter(...params: Parameters<ListValue["setFilter"]>): void {
        this.resetFlags();
        this.datasource.setFilter(...params);
    }
}
