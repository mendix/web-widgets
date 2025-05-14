import { computed, makeObservable, observable } from "mobx";
import { ObservableSortStore, SortingStoreObserver, SortInstruction } from "../typings";

export class SortObserver implements SortingStoreObserver {
    private readonly _stores: Map<string, [store: ObservableSortStore, dispose: () => void]> = new Map();

    constructor() {
        makeObservable<SortObserver, "stores">(this, {
            sortOrder: computed,
            stores: observable.shallow
        });
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
