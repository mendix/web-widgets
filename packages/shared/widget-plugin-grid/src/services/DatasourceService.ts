import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ListValue, ObjectItem, ValueStatus } from "mendix";
import { action, autorun, makeAutoObservable, when } from "mobx";
import { QueryService } from "../interfaces/QueryService";

interface DynamicProps {
    datasource: ListValue;
}

export class DatasourceService implements SetupComponent, QueryService {
    private backgroundCheck = false;
    private fetching = false;
    private baseLimit = Infinity;

    constructor(
        host: SetupComponentHost,
        private gate: DerivedPropsGate<DynamicProps>,
        private refreshIntervalMs = 0
    ) {
        host.add(this);

        type PrivateMembers =
            | "resetFlags"
            | "updateFlags"
            | "setRefreshing"
            | "setFetching"
            | "baseLimit"
            | "setIsLoaded";
        makeAutoObservable<this, PrivateMembers>(this, {
            setup: false,
            baseLimit: false,
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
        this.datasource.setLimit(this.baseLimit);
    }

    private get isDSLoading(): boolean {
        return this.datasource.status === "loading";
    }

    private get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    get items(): ObjectItem[] | undefined {
        return this.datasource.items;
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

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(
            autorun(() => {
                // Always use actions to set flags to avoid subscribing to them
                this.updateFlags(this.datasource.status);
            })
        );

        if (this.refreshIntervalMs > 0) {
            let timerId: number | undefined;
            const clearAutorun = autorun(() => {
                // Subscribe to items to reschedule timer on items change
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                this.items;
                clearInterval(timerId);
                timerId = window.setTimeout(() => this.backgroundRefresh(), this.refreshIntervalMs);
            });
            add(() => {
                clearAutorun();
                clearInterval(timerId);
            });
        }

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

    setBaseLimit(size: number): void {
        this.baseLimit = size;
        this.resetLimit();
    }

    reload(): Promise<void> {
        const ds = this.datasource;
        this.datasource.reload();
        return when(() => this.datasource !== ds);
    }

    fetchPage({
        limit,
        offset,
        signal
    }: {
        limit: number;
        offset: number;
        signal?: AbortSignal;
    }): Promise<ObjectItem[]> {
        return new Promise((resolve, reject) => {
            if (signal && signal.aborted) {
                return reject(signal.reason);
            }

            const pageIsLoaded = when(
                () =>
                    this.datasource.offset === offset &&
                    this.datasource.limit === limit &&
                    this.datasource.status === "available",
                { signal }
            );

            pageIsLoaded.then(() => resolve(this.datasource.items ?? []), reject);

            this.datasource.setOffset(offset);
            this.datasource.setLimit(limit);
        });
    }
}
