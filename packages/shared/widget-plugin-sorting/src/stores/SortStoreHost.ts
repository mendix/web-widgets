import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { ObservableSortStore, SortInstruction } from "../types/store";

export class SortStoreHost {
    private _store: ObservableSortStore | null = null;
    private _usedBy: string | null = null;

    get sortOrder(): SortInstruction[] {
        return this._store?.sortOrder ?? [];
    }

    constructor() {
        makeObservable<this, "_usedBy">(this, {
            sortOrder: computed,
            useHost: action,
            _usedBy: observable,
            usedBy: computed,
            observe: action,
            unobserve: action
        });
    }

    // TODO: toJSON

    // TODO: fromJSON

    observe(store: ObservableSortStore): void {
        this._store = store;
    }

    unobserve(): void {
        this._store = null;
    }

    useHost(id: string): () => void {
        this._usedBy = id;
        return () => runInAction(() => (this._usedBy = null));
    }

    get usedBy(): string | null {
        return this._usedBy;
    }
}
