import { autorun, makeAutoObservable, reaction } from "mobx";
import { ObservableSortStore, ObservableSortStoreHost } from "../ObservableSortStoreHost";
import { SortDirection, SortInstruction } from "../SortingStoreInterface";

export interface SortRecord {
    key: string;
    attrId: string;
    dir: SortDirection;
}

export class SortStoreHost implements ObservableSortStoreHost {
    private readonly _disposeMap: WeakMap<ObservableSortStore, () => void> = new WeakMap();
    private readonly _state: SortRecord[] = [];

    constructor() {
        makeAutoObservable<this, "_stores">(this, {
            _stores: false
        });
    }

    observe(store: ObservableSortStore, key: string): void {
        this.unobserve(store);

        // We always initialize store from the host
        const clearAutorun = autorun(() => {
            const record = this._state.find(record => record.key === key);
            store.sortOrder = record ? this._toSortInstruction(record) : null;
        });

        // This reaction is used to update the host when the store changes
        const clearReaction = reaction(
            () => (store.sortOrder ? this._toRecord(store.sortOrder, key) : null),
            storeRecord => {
                const index = this._state.findIndex(record => record.key === key);
                // Update the record
                if (index > -1 && storeRecord) {
                    Object.assign(this._state[index], storeRecord);
                    return;
                }
                // Remove the record if it is null
                if (index > -1 && storeRecord === null) {
                    this._state.splice(index, 1);
                    return;
                }
                // Add the record if it is not already present
                if (index === -1 && storeRecord) {
                    this._state.push(storeRecord);
                }
            }
        );

        const dispose = (): void => {
            clearAutorun();
            clearReaction();
            this._disposeMap.delete(store);
            const index = this._state.findIndex(record => record.key === key);
            if (index !== -1) {
                this._state.splice(index, 1);
            }
        };

        this._disposeMap.set(store, dispose);
    }

    unobserve(store: ObservableSortStore): void {
        const dispose = this._disposeMap.get(store);
        if (dispose) {
            dispose();
        }
    }

    get sortOrder(): SortInstruction[] {
        return this._state.map(record => this._toSortInstruction(record));
    }

    get state(): SortRecord[] {
        return [...this._state];
    }

    set state(records: SortRecord[]) {
        this._state.length = 0;

        type ReduceRec = [acc: SortRecord[], indexMap: Map<string, number>, index: number];

        const [deduplicatedRecords] = records.reduce<ReduceRec>(
            ([acc, map, index], record: SortRecord) => {
                if (map.has(record.key)) {
                    acc[map.get(record.key)!] = record;
                    return [acc, map, index];
                } else {
                    map.set(record.key, index);
                    acc.push(record);
                    return [acc, map, index + 1];
                }
            },
            [[], new Map(), 0]
        );

        this._state.push(...deduplicatedRecords);
    }

    private _toSortInstruction(record: SortRecord): SortInstruction {
        return [record.attrId, record.dir] as SortInstruction;
    }

    private _toRecord(instruction: SortInstruction, key: string): SortRecord | null {
        const [attrId, dir] = instruction;
        return { key, attrId, dir };
    }
}
