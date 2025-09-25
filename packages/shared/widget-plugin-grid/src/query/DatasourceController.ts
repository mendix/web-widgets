import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue, ObjectItem, ValueStatus } from "mendix";
import { action, autorun, computed, IComputedValue, makeAutoObservable, when } from "mobx";
import { QueryController } from "./query-controller";

type Gate = DerivedPropsGate<{ datasource: ListValue }>;

type DatasourceControllerSpec = { gate: Gate };

export class DatasourceController implements ReactiveController, QueryController {
    private gate: Gate;
    private backgroundCheck = false;
    private fetching = false;
    private pageSize = Infinity;

    constructor(host: ReactiveControllerHost, spec: DatasourceControllerSpec) {
        host.addController(this);
        this.gate = spec.gate;

        type PrivateMembers =
            | "resetFlags"
            | "updateFlags"
            | "setRefreshing"
            | "setFetching"
            | "pageSize"
            | "setIsLoaded";
        makeAutoObservable<this, PrivateMembers>(this, {
            setup: false,
            pageSize: false,
            updateFlags: action,
            resetFlags: action,
            setRefreshing: action,
            setFetching: action,
            setIsLoaded: action
        });
    }

    private resetFlags(): void {
        this.backgroundCheck = false;
        this.fetching = false;
    }

    private updateFlags(status: ValueStatus): void {
        if (this.backgroundCheck) {
            this.setBackgroundCheck(status === "loading");
        }
        if (this.fetching) {
            this.setFetching(status === "loading");
        }
    }

    private setBackgroundCheck(value: boolean): void {
        this.backgroundCheck = value;
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

    get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    get isFirstLoad(): boolean {
        return this.isDSLoading && this.datasource.items === undefined;
    }

    get isRefreshing(): boolean {
        return this.isDSLoading && this.datasource.items !== undefined;
    }

    get isSilentRefresh(): boolean {
        return this.backgroundCheck;
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

    get hasMoreItems(): boolean {
        return this.datasource.hasMoreItems ?? false;
    }

    /**
     * Returns computed value that holds controller copy.
     * Recomputes the copy every time the datasource changes.
     */
    get derivedQuery(): IComputedValue<DatasourceController> {
        const data = (): DatasourceController => [this.datasource].map(() => Object.create(this))[0];

        return computed(data);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(
            autorun(() => {
                // Always use actions to set flags to avoid subscribing to them
                this.updateFlags(this.datasource.status);
            })
        );

        return disposeAll;
    }

    backgroundRefresh(): void {
        if (this.isDSLoading) {
            return;
        }
        this.setBackgroundCheck(true);
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

    fetchPage(limit: number, offset: number, signal: AbortSignal): Promise<ObjectItem[]> {
        return new Promise((resolve, reject) => {
            if (signal.aborted) {
                return reject(signal.reason);
            }

            const predicate = when(
                () =>
                    this.datasource.offset === offset &&
                    this.datasource.limit === limit &&
                    this.datasource.status === "available"
            );

            predicate.then(() => resolve(this.datasource.items ?? [])).catch(reject);

            this.datasource.setOffset(offset);
            this.datasource.setLimit(limit);

            signal.addEventListener("abort", () => predicate.cancel());
        });
    }
}
