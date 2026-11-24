import type { ListValue, ObjectItem, ValueStatus } from "mendix";
import type { FilterCondition } from "mendix/filters";
import type { DataStore } from "./DataStore.js";
import { Emitter } from "./Emitter.js";
import { query, SortInstruction } from "./evaluate.js";

export interface LiveListOptions {
    entity: string;
    /** Fixed constraint of the data source (the XPath of a database source), combined with `setFilter`. */
    constraint?: FilterCondition;
    /** Initial sort order, the data source's own sort setting. */
    sortOrder?: SortInstruction[];
    limit?: number;
    /** Milliseconds between a request and the `available` result. */
    delay?: number;
    /** Reload when the store changes, like a refresh-in-client. Defaults to `true`. */
    reloadOnStoreChange?: boolean;
}

interface Params {
    offset: number;
    limit: number;
    sortOrder: SortInstruction[];
    filter: FilterCondition | undefined;
    needTotal: boolean;
}

/**
 * A data source over the store. `value` is an immutable `ListValue` snapshot; every change produces
 * a new snapshot and notifies subscribers, the way the Mendix client hands widgets new props.
 */
export class LiveList {
    private readonly emitter = new Emitter();
    private params: Params;
    private status: ValueStatus = "loading" as ValueStatus;
    private items: ObjectItem[] | undefined = undefined;
    private totalCount: number | undefined = undefined;
    private hasMoreItems: boolean | undefined = undefined;
    private timer: ReturnType<typeof setTimeout> | undefined;
    private snapshot: ListValue;
    private readonly unsubscribeStore: () => void;
    private readonly delay: number;
    readonly requests: Array<{ kind: string; value: unknown }> = [];

    constructor(
        private readonly store: DataStore,
        private readonly options: LiveListOptions
    ) {
        store.entity(options.entity);
        this.delay = options.delay ?? 0;
        this.params = {
            offset: 0,
            limit: options.limit ?? Infinity,
            sortOrder: options.sortOrder ?? [],
            filter: undefined,
            needTotal: false
        };
        this.snapshot = this.createSnapshot();
        this.unsubscribeStore =
            options.reloadOnStoreChange === false ? () => undefined : store.subscribe(() => this.request());
        this.schedule();
    }

    get value(): ListValue {
        return this.snapshot;
    }

    subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

    /** Resolves once the list is `available` with no pending request. */
    settled(): Promise<void> {
        if (this.timer === undefined && this.status === "available") {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            const unsubscribe = this.subscribe(() => {
                if (this.timer === undefined && this.status === "available") {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }

    dispose(): void {
        clearTimeout(this.timer);
        this.unsubscribeStore();
    }

    private update(patch: Partial<Params>, kind: string, value: unknown): void {
        this.requests.push({ kind, value });
        this.params = { ...this.params, ...patch };
        this.request();
    }

    private request(): void {
        this.status = "loading" as ValueStatus;
        this.publish();
        this.schedule();
    }

    private schedule(): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.load(), this.delay);
    }

    private load(): void {
        this.timer = undefined;
        const { offset, limit, sortOrder, filter, needTotal } = this.params;
        const all = query(this.store, this.options.entity, [this.options.constraint, filter], sortOrder);
        const page = all.slice(offset, limit === Infinity ? undefined : offset + limit);
        this.items = page.map(obj => this.store.item(obj.id));
        this.hasMoreItems = offset + page.length < all.length;
        this.totalCount = needTotal ? all.length : undefined;
        this.status = "available" as ValueStatus;
        this.publish();
    }

    private publish(): void {
        this.snapshot = this.createSnapshot();
        this.emitter.emit();
    }

    private createSnapshot(): ListValue {
        const { offset, limit, sortOrder, filter } = this.params;
        return Object.freeze({
            status: this.status,
            offset,
            limit,
            sortOrder: sortOrder as ListValue["sortOrder"],
            filter,
            items: this.items,
            totalCount: this.totalCount,
            hasMoreItems: this.hasMoreItems,
            setOffset: (value: number) => {
                if (value !== this.params.offset) {
                    this.update({ offset: value }, "setOffset", value);
                }
            },
            setLimit: (value: number | undefined) => {
                const next = value ?? Infinity;
                if (next !== this.params.limit) {
                    this.update({ limit: next }, "setLimit", value);
                }
            },
            requestTotalCount: (value: boolean) => {
                if (value !== this.params.needTotal) {
                    this.update({ needTotal: value }, "requestTotalCount", value);
                }
            },
            setSortOrder: (value: ListValue["sortOrder"] | undefined) =>
                this.update({ sortOrder: (value ?? []) as SortInstruction[] }, "setSortOrder", value),
            setFilter: (value: FilterCondition | undefined) => this.update({ filter: value }, "setFilter", value),
            reload: () => this.update({}, "reload", undefined)
        }) as ListValue;
    }
}
