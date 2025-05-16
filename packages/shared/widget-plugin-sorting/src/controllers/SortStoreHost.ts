import { autorun, makeAutoObservable, observable, reaction } from "mobx";
import { ObservableSortStore, ObservableSortStoreHost } from "../ObservableSortStoreHost";
import { SortInstruction } from "../SortingStoreInterface";

export class SortStoreHost implements ObservableSortStoreHost {
    private readonly _stores: Map<string, [store: ObservableSortStore, dispose: () => void]> = new Map();
    private readonly _storeOrder: string[] = [];
    private readonly _sortOrder: SortInstruction[] = [];

    constructor() {
        makeAutoObservable<this, "_sortOrder">(this, {
            _sortOrder: observable.shallow
        });
    }

    observe(key: string, store: ObservableSortStore): void {
        this.unobserve(key);

        const clearAutorun = autorun(() => {
            const index = this._storeOrder.indexOf(key);
            store.sortOrder = this._sortOrder[index] ?? null;
        });

        const clearReaction = reaction(
            () => store.sortOrder,
            (sortOrder: SortInstruction | null) => {
                const index = this._storeOrder.indexOf(key);
                if (index === -1) {
                    return;
                }
                if (sortOrder) {
                    this._sortOrder[index] = sortOrder;
                } else {
                    this._sortOrder.splice(index, 1);
                }
            }
        );

        const dispose = (): void => {
            clearAutorun();
            clearReaction();
            this._storeOrder.splice(this._storeOrder.indexOf(key), 1);
            this._stores.delete(key);
        };

        this._stores.set(key, [store, dispose]);
        this._storeOrder.push(key);
    }

    unobserve(key: string): void {
        const dispose = this._stores.get(key)?.[1];
        if (dispose) {
            dispose();
        }
    }

    get sortOrder(): SortInstruction[] {
        return [...this._sortOrder];
    }

    set sortOrder(sortOrder: SortInstruction[]) {
        this._sortOrder.length = 0;
        this._sortOrder.push(...sortOrder);
    }
}
