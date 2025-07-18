import { action, autorun, computed, makeObservable, observable, runInAction } from "mobx";
import { ObservableSortStore, SortInstruction } from "../types/store";

export class SortStoreHost {
    private _usedBy: string[] = [];
    private _state: SortInstruction[];
    private _cleanup: (() => void) | null = null;

    constructor(spec: { initSort?: SortInstruction[] } = {}) {
        this._state = spec.initSort ?? [];

        makeObservable<this, "_usedBy" | "_state" | "_setState">(this, {
            _state: observable.ref,
            sortOrder: computed,
            lock: action,
            _usedBy: observable,
            usedBy: computed,
            observe: action,
            unobserve: action,
            _setState: action
        });
    }

    private _setState(state: SortInstruction[]): void {
        this._state = state;
    }

    get sortOrder(): SortInstruction[] {
        return this._state;
    }

    observe(store: ObservableSortStore): void {
        if (this._cleanup) {
            this._cleanup();
        }
        this._cleanup = autorun(() => {
            this._setState(store.sortOrder);
        });
    }

    unobserve(): void {
        this._cleanup?.();
        this._cleanup = null;
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

    // fromJSON(data: PlainJs): void {
    //     if (data == null || !Array.isArray(data)) {
    //         return;
    //     }
    //     if (this._store) {
    //         this._store.fromJSON(data);
    //     }
    // }
}
