import type { ListValue, ObjectItem, ValueStatus } from "mendix";
import type { FilterCondition } from "mendix/filters";
import type { DataStore } from "./DataStore.js";
import { Emitter } from "./Emitter.js";
import { query, SortInstruction } from "./evaluate.js";
import { sameValue } from "./same-value.js";

export interface LiveListOptions {
    entity: string;
    /** Fixed constraint of the data source (the XPath of a database source), combined with `setFilter`. */
    constraint?: FilterCondition;
    /** The data source's own sort order; `setSortOrder(undefined)` restores it. */
    sortOrder?: SortInstruction[];
    limit?: number;
    /** Milliseconds a request takes before its result is `available`. */
    delay?: number;
    /**
     * A request that takes longer than this many milliseconds publishes a `loading` value first.
     * The Mendix client skips the `loading` value for fast responses.
     */
    loadingThreshold?: number;
    /** Reload when the store changes, like the client does after a commit. Defaults to `true`. */
    reloadOnStoreChange?: boolean;
}

interface Params {
    offset: number;
    limit: number;
    sortOrder: SortInstruction[];
    filter: FilterCondition | undefined;
    needTotal: boolean;
}

interface Result {
    items: ObjectItem[] | undefined;
    totalCount: number | undefined;
    hasMoreItems: boolean | undefined;
}

export type LoadHook = (items: ObjectItem[]) => void;

const DEFAULT_LOADING_THRESHOLD = 75;

/**
 * A data source over the store. `value` is an immutable `ListValue` snapshot; every change produces
 * a new snapshot and notifies subscribers, the way the Mendix client hands widgets new props.
 * Snapshots report the parameters of the data they hold: while a request is pending, `loading`
 * keeps the previous parameters and items.
 */
export class LiveList {
    private readonly emitter = new Emitter();
    private readonly loadHooks = new Set<LoadHook>();
    private applied: Params;
    private pending: Params;
    private status: ValueStatus = "loading" as ValueStatus;
    private result: Result = { items: undefined, totalCount: undefined, hasMoreItems: undefined };
    private fetched: { key: string; rows: number; complete: boolean } | undefined;
    private loadTimer: ReturnType<typeof setTimeout> | undefined;
    private loadingTimer: ReturnType<typeof setTimeout> | undefined;
    private snapshot: ListValue;
    private readonly unsubscribeStore: () => void;
    private delay: number;
    readonly requests: Array<{ kind: string; value: unknown }> = [];

    constructor(
        private readonly store: DataStore,
        private readonly options: LiveListOptions
    ) {
        store.entity(options.entity);
        this.delay = options.delay ?? 0;
        this.applied = {
            offset: 0,
            limit: options.limit ?? Infinity,
            sortOrder: options.sortOrder ?? [],
            filter: undefined,
            needTotal: false
        };
        this.pending = this.applied;
        this.snapshot = this.createSnapshot();
        this.unsubscribeStore =
            options.reloadOnStoreChange === false ? () => undefined : store.subscribe(() => this.request({}, true));
        this.loadTimer = setTimeout(() => this.load(), this.delay);
    }

    get value(): ListValue {
        return this.snapshot;
    }

    subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

    /** Runs before every `available` value is published, with the items it will hold. */
    onLoad(hook: LoadHook): () => void {
        this.loadHooks.add(hook);
        return () => this.loadHooks.delete(hook);
    }

    setDelay(ms: number): void {
        this.delay = ms;
    }

    /** Resolves once the list is `available` with no pending request. */
    settled(): Promise<void> {
        const done = (): boolean => this.loadTimer === undefined && this.status === "available";
        if (done()) {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            const unsubscribe = this.subscribe(() => {
                if (done()) {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }

    dispose(): void {
        clearTimeout(this.loadTimer);
        clearTimeout(this.loadingTimer);
        this.unsubscribeStore();
    }

    private request(patch: Partial<Params>, force = false): void {
        const next = { ...this.pending, ...patch };
        if (!force && sameValue(next, this.pending)) {
            return;
        }
        this.pending = next;
        clearTimeout(this.loadTimer);
        clearTimeout(this.loadingTimer);
        this.loadingTimer = undefined;

        if (!force && this.canServeFromFetched(next)) {
            this.loadTimer = setTimeout(() => this.load(), 0);
            return;
        }
        this.fetched = force ? undefined : this.fetched;
        this.loadTimer = setTimeout(() => this.load(), this.delay);
        const threshold = this.options.loadingThreshold ?? DEFAULT_LOADING_THRESHOLD;
        if (this.status === "available" && this.delay > threshold) {
            this.loadingTimer = setTimeout(() => {
                this.loadingTimer = undefined;
                this.status = "loading" as ValueStatus;
                this.publish();
            }, threshold);
        }
    }

    private canServeFromFetched(next: Params): boolean {
        if (next.limit === 0) {
            return true;
        }
        const onlyLimitChanged = sameValue({ ...next, limit: this.applied.limit }, this.applied);
        if (!onlyLimitChanged || !this.fetched || this.fetched.key !== this.queryKey(next)) {
            return false;
        }
        return this.fetched.complete || next.limit <= this.fetched.rows;
    }

    private queryKey(params: Params): string {
        return JSON.stringify([params.offset, params.sortOrder, params.filter]);
    }

    private load(): void {
        this.loadTimer = undefined;
        clearTimeout(this.loadingTimer);
        this.loadingTimer = undefined;

        const params = this.pending;
        const { offset, limit, sortOrder, filter, needTotal } = params;
        const all = query(this.store, this.options.entity, [this.options.constraint, filter], sortOrder);
        if (limit === 0) {
            this.result = { items: [], totalCount: undefined, hasMoreItems: all.length > 0 };
        } else {
            const page = all.slice(offset, limit === Infinity ? undefined : offset + limit);
            const hasMoreItems = offset + page.length < all.length;
            this.result = {
                items: page.map(obj => this.store.item(obj.id)),
                totalCount: needTotal ? all.length : undefined,
                hasMoreItems
            };
            const key = this.queryKey(params);
            const rows = this.fetched?.key === key ? Math.max(this.fetched.rows, page.length) : page.length;
            this.fetched = { key, rows, complete: !hasMoreItems || this.fetched?.complete === true };
        }
        this.applied = params;
        this.status = "available" as ValueStatus;
        for (const hook of this.loadHooks) {
            hook(this.result.items ?? []);
        }
        this.publish();
    }

    private publish(): void {
        this.snapshot = this.createSnapshot();
        this.emitter.emit();
    }

    private log(kind: string, value: unknown): void {
        this.requests.push({ kind, value });
    }

    private createSnapshot(): ListValue {
        const { offset, limit, sortOrder, filter } = this.applied;
        return Object.freeze({
            status: this.status,
            offset,
            limit,
            sortOrder: sortOrder as ListValue["sortOrder"],
            filter,
            ...this.result,
            setOffset: (value: number) => {
                this.log("setOffset", value);
                this.request({ offset: value });
            },
            setLimit: (value: number | undefined) => {
                this.log("setLimit", value);
                this.request({ limit: value ?? Infinity });
            },
            requestTotalCount: (value: boolean) => {
                this.log("requestTotalCount", value);
                this.request({ needTotal: value });
            },
            setSortOrder: (value: ListValue["sortOrder"] | undefined) => {
                this.log("setSortOrder", value);
                this.request({ sortOrder: (value ?? this.options.sortOrder ?? []) as SortInstruction[] });
            },
            setFilter: (value: FilterCondition | undefined) => {
                this.log("setFilter", value);
                this.request({ filter: value });
            },
            reload: () => {
                this.log("reload", undefined);
                this.request({}, true);
            }
        }) as ListValue;
    }
}
