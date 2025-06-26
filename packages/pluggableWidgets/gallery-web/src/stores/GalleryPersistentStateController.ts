import { Json, Serializable } from "@mendix/filter-commons/typings/settings";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { action, comparer, computed, makeObservable, reaction } from "mobx";
import { ObservableJsonStorage } from "src/typings/storage";

interface PersistentState {
    version: 1;
    [key: string]: Json;
}

interface GalleryPersistentStateControllerSpec {
    filtersHost: Serializable;
    sortHost: Serializable;
    storage: ObservableJsonStorage;
}

export class GalleryPersistentStateController {
    private readonly _storage: ObservableJsonStorage;
    private readonly _filtersHost: Serializable;
    private readonly _sortHost: Serializable;

    constructor(host: ReactiveControllerHost, spec: GalleryPersistentStateControllerSpec) {
        host.addController(this);
        this._storage = spec.storage;
        this._filtersHost = spec.filtersHost;
        this._sortHost = spec.sortHost;

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

    private get _persistentState(): PersistentState {
        return this.toJSON();
    }

    private _validate(data: Json): data is PersistentState {
        if (data == null || typeof data !== "object" || !("version" in data) || data.version !== 1) {
            return false;
        }
        return true;
    }

    fromJSON(data: PersistentState): void {
        this._filtersHost.fromJSON(data.filters);
        this._sortHost.fromJSON(data.sort);
    }

    toJSON(): PersistentState {
        return {
            version: 1,
            filters: this._filtersHost.toJSON(),
            sort: this._sortHost.toJSON()
        };
    }
}
