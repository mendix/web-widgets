import { PlainJs } from "@mendix/filter-commons/typings/settings";
import { action, autorun, computed, makeObservable, observable, runInAction } from "mobx";
import { ObservableSortStore, SortInstruction } from "../types/store";

export class SortStoreHost {
    private _usedBy: string[] = [];
    private _state: SortInstruction[];
    private _cleanup: (() => void) | null = null;
    private _store: ObservableSortStore | null = null;
    private _jsonBuffer: PlainJs | null = null;

    constructor(spec: { initSort?: SortInstruction[] } = {}) {
        this._state = spec.initSort ?? [];

        makeObservable<this, "_usedBy" | "_state" | "_setState" | "_jsonBuffer">(this, {
            _state: observable.ref,
            _jsonBuffer: observable.ref,
            sortOrder: computed,
            lock: action,
            _usedBy: observable,
            usedBy: computed,
            observe: action,
            unobserve: action,
            _setState: action,
            fromJSON: action
        });
    }

    private _setState(state: SortInstruction[]): void {
        this._state = state;
    }

    get sortOrder(): SortInstruction[] {
        return this._state;
    }

    observe(store: ObservableSortStore): void {
        this.unobserve();

        // Set the initial state from the json buffer if available
        const clearJson = autorun(() => {
            const data = this._jsonBuffer;
            if (data == null || !Array.isArray(data)) {
                return;
            }
            store.fromJSON(data);
        });

        // Sync the store's sort order with the host's state
        const clearSync = autorun(() => {
            this._setState(store.sortOrder);
        });

        this._store = store;
        this._cleanup = () => {
            this._store = null;
            this._jsonBuffer = null;
            this._cleanup = null;
            clearJson();
            clearSync();
        };
    }

    unobserve(): void {
        this._cleanup?.();
    }

    lock(id: string): () => void {
        if (this._usedBy.indexOf(id) === -1) {
            this._usedBy.push(id);
        }
        const remove = (): void => {
            runInAction(() => {
                const index = this._usedBy.indexOf(id);
                if (index !== -1) {
                    this._usedBy.splice(index, 1);
                }
            });
        };
        return remove;
    }

    get usedBy(): string | null {
        return this._usedBy.at(0) ?? null;
    }

    // toJSON(): PlainJs {
    //     return this._store ? this._store.toJSON() : null;
    // }

    fromJSON(data: PlainJs): void {
        this._jsonBuffer = data;
    }
}
