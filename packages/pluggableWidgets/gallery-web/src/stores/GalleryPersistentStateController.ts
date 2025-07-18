import { PlainJs, Serializable } from "@mendix/filter-commons/typings/settings";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { action, comparer, computed, makeObservable, reaction } from "mobx";
import { ObservableStorage } from "src/typings/storage";

interface GalleryPersistentStateControllerSpec {
    filtersHost: Serializable;
    sortHost: Serializable;
    storage: ObservableStorage;
    storeFilters: boolean;
    storeSort: boolean;
}

export class GalleryPersistentStateController {
    private readonly _storage: ObservableStorage;
    private readonly _filtersHost: Serializable;
    private readonly _sortHost: Serializable;
    readonly storeFilters: boolean;
    readonly storeSort: boolean;

    readonly schemaVersion: number = 1;

    constructor(host: ReactiveControllerHost, spec: GalleryPersistentStateControllerSpec) {
        host.addController(this);
        this._storage = spec.storage;
        this._filtersHost = spec.filtersHost;
        this._sortHost = spec.sortHost;
        this.storeFilters = spec.storeFilters;
        this.storeSort = spec.storeSort;

        makeObservable<this, "_persistentState">(this, {
            _persistentState: computed,
            fromJSON: action
        });
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        // Write state to storage
        const clearWrite = reaction(
            () => this._persistentState,
            data => this._storage.setData(data),
            { delay: 250, equals: comparer.structural }
        );

        // Update state from storage
        const clearRead = reaction(
            () => this._storage.data,
            data => {
                if (data == null) {
                    return;
                }
                if (this._validate(data)) {
                    this.fromJSON(data);
                } else {
                    console.warn("Invalid gallery settings. Reset storage to avoid conflicts.");
                    this._storage.setData(null);
                }
            },
            { fireImmediately: true, equals: comparer.structural }
        );

        add(clearWrite);
        add(clearRead);

        return disposeAll;
    }

    private get _persistentState(): PlainJs {
        return this.toJSON();
    }

    private _validate(data: PlainJs): data is { [key: string]: PlainJs } {
        if (data == null || typeof data !== "object" || !("version" in data) || data.version !== this.schemaVersion) {
            return false;
        }
        return true;
    }

    fromJSON(data: PlainJs): void {
        if (!this._validate(data)) {
            return;
        }
        if (this.storeFilters) {
            this._filtersHost.fromJSON(data.filters);
        }
        if (this.storeSort) {
            this._sortHost.fromJSON(data.sort);
        }
    }

    toJSON(): PlainJs {
        const data: PlainJs = { version: 1 };
        if (this.storeFilters) {
            data.filters = this._filtersHost.toJSON();
        }
        if (this.storeSort) {
            data.sort = this._sortHost.toJSON();
        }
        return data;
    }
}
