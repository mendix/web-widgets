import { PlainJs, Serializable } from "@mendix/filter-commons/typings/settings";
import { action, computed, makeObservable, observable } from "mobx";
import { ObservableSortStore, SortInstruction } from "../types/store";

export class SortStoreHost implements Serializable {
    private _store: ObservableSortStore | null = null;
    private _usedBy: string[] = [];

    get sortOrder(): SortInstruction[] {
        return this._store?.sortOrder ?? [];
    }

    constructor() {
        makeObservable<this, "_usedBy" | "_add" | "_remove">(this, {
            sortOrder: computed,
            lock: action,
            _add: action,
            _remove: action,
            _usedBy: observable,
            usedBy: computed,
            observe: action,
            unobserve: action
        });
    }

    observe(store: ObservableSortStore): void {
        this._store = store;
    }

    unobserve(): void {
        this._store = null;
    }

    lock(id: string): () => void {
        this._add(id);
        return () => this._remove(id);
    }

    private _add(id: string): void {
        if (this._usedBy.indexOf(id) === -1) {
            this._usedBy.push(id);
        }
    }

    private _remove(id: string): void {
        const index = this._usedBy.indexOf(id);
        if (index !== -1) {
            this._usedBy.splice(index, 1);
        }
    }

    get usedBy(): string | null {
        return this._usedBy.at(0) ?? null;
    }

    toJSON(): PlainJs {
        return this._store ? this._store.toJSON() : null;
    }

    fromJSON(data: PlainJs): void {
        if (data == null || !Array.isArray(data)) {
            return;
        }
        if (this._store) {
            this._store.fromJSON(data);
        }
    }
}
