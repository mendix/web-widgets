import { makeAutoObservable } from "mobx";
import { ObservableSortStore, ObservableSortStoreHost } from "../observable-sort-host";
import { SortInstruction } from "../typings";

export class SortStoreHost implements ObservableSortStoreHost {
    private readonly _stores: Map<string, [store: ObservableSortStore, dispose: () => void]> = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    observe(key: string, store: ObservableSortStore): void {
        this.unobserve(key);

        const dispose = (): void => {
            this._stores.delete(key);
        };

        this._stores.set(key, [store, dispose]);
    }

    unobserve(key: string): void {
        if (this._stores.has(key)) {
            this._stores.get(key)?.[1]();
        }
    }

    get sortOrder(): SortInstruction[] {
        return [...this._stores.values()].flatMap(([store]) => store.sortOrder);
    }
}
