import { PlainJs, Serializable } from "@mendix/filter-commons/typings/settings";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { action, comparer, computed, makeObservable, reaction } from "mobx";
import { ObservableStorage } from "src/typings/storage";
import { GallerySettingsConfig } from "../../model/configs/GallerySettings.config";

export class GallerySettingsSyncService implements SetupComponent {
    readonly schemaVersion: number = 1;

    constructor(
        host: SetupComponentHost,
        private filtersHost: Serializable,
        private sortHost: Serializable,
        private storage: ObservableStorage,
        private config: GallerySettingsConfig
    ) {
        host.add(this);

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
            data => this.storage.setData(data),
            { delay: 250, equals: comparer.structural }
        );

        // Update state from storage
        const clearRead = reaction(
            () => this.storage.data,
            data => {
                if (data == null) {
                    return;
                }
                if (this._validate(data)) {
                    this.fromJSON(data);
                } else {
                    console.warn("Invalid gallery settings. Reset storage to avoid conflicts.");
                    this.storage.setData(null);
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
        if (this.config.storeFilters) {
            this.filtersHost.fromJSON(data.filters);
        }
        if (this.config.storeSort) {
            this.sortHost.fromJSON(data.sort);
        }
    }

    toJSON(): PlainJs {
        const data: PlainJs = { version: 1 };
        if (this.config.storeFilters) {
            data.filters = this.filtersHost.toJSON();
        }
        if (this.config.storeSort) {
            data.sort = this.sortHost.toJSON();
        }
        return data;
    }
}
