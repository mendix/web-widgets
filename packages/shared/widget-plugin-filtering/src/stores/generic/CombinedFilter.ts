import { reduceArray, restoreArray } from "@mendix/filter-commons/condition-utils";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { FilterCondition } from "mendix/filters";
import { autorun, reaction } from "mobx";
import { fnv1aHash } from "../../utils/fnv-1a-hash";

export type ConditionWithMeta = {
    cond: FilterCondition | undefined;
    meta: string;
};

interface ObservableInput {
    condWithMeta: ConditionWithMeta;
    metaKey: string;
    hydrate(value: ConditionWithMeta): void;
}

type MetaBag = Record<string, string>;

export class CombinedFilter {
    private _inputs: ObservableInput[];
    readonly stableKey: string;
    readonly ownMetaKey = "CombinedFilter";

    constructor(spec: { stableKey: string; inputs: ObservableInput[] }) {
        this._inputs = spec.inputs;
        this.stableKey = spec.stableKey;
    }

    storageKey(hash: string): string {
        return `${this.stableKey}-${hash}`;
    }

    readMetaFromStorage(key: string): MetaBag | null {
        const item = sessionStorage.getItem(key);
        if (!item) {
            return null;
        }
        try {
            return JSON.parse(item) as MetaBag;
        } catch (e) {
            console.error(`CombinedFilter.readFilterMeta: Error parsing meta for key ${key}`, e);
            return null;
        }
    }

    clearFilterMeta(hash: string): void {
        sessionStorage.removeItem(this.storageKey(hash));
    }

    filterHash(filter: FilterCondition): string {
        return fnv1aHash(JSON.stringify(filter)).toString();
    }

    restoreMeta(filter: FilterCondition): MetaBag | null {
        const hash = this.filterHash(filter);
        const key = this.storageKey(hash);
        return this.readMetaFromStorage(key);
    }

    hydrate(filter: FilterCondition | undefined): void {
        if (!filter) {
            return;
        }

        const meta = this.restoreMeta(filter);
        if (!meta) {
            return;
        }

        const conditions = restoreArray(filter, meta[this.ownMetaKey]);
        if (conditions.length !== this._inputs.length) {
            console.error(
                `CombinedFilter.hydrate: Number of conditions (${conditions.length}) does not match number of inputs (${this._inputs.length})`
            );
            return;
        }

        for (let i = 0; i < this._inputs.length; i++) {
            const input = this._inputs[i];
            const condWithMeta: ConditionWithMeta = {
                cond: conditions[i],
                meta: meta[input.metaKey]
            };

            input.hydrate(condWithMeta);
        }
    }

    get filter(): FilterCondition | undefined {
        return this.filterWithBag.filter;
    }

    get filterWithBag(): {
        filter: FilterCondition | undefined;
        bag: MetaBag;
        hash: string | null;
    } {
        const bag: MetaBag = {};
        const conditions: Array<FilterCondition | undefined> = [];

        for (const { condWithMeta: data, metaKey } of this._inputs) {
            bag[metaKey] = data.meta;
            conditions.push(data.cond);
        }

        const [filter, meta] = reduceArray(conditions);
        bag[this.ownMetaKey] = meta;

        return { filter, bag, hash: filter ? this.filterHash(filter) : null };
    }

    private _saveFilterMeta(hash: string | null, bag: MetaBag): void {
        if (!hash) {
            return;
        }

        sessionStorage.setItem(this.storageKey(hash), JSON.stringify(bag));
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(autorun(() => console.dir(this.filter)));

        add(
            reaction(
                () => this.filterWithBag,
                (next, prev) => {
                    if (prev && prev.hash) {
                        this.clearFilterMeta(prev.hash);
                    }
                    if (next.hash) {
                        this._saveFilterMeta(next.hash, next.bag);
                    }
                }
            )
        );

        return disposeAll;
    }
}
