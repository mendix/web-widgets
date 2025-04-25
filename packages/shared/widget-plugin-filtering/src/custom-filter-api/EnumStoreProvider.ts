import { StaticSelectFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";
import { FilterAPI } from "../context";
import { BaseStoreProvider } from "./BaseStoreProvider";
import { FilterSpec } from "./typings";

export class EnumStoreProvider extends BaseStoreProvider<StaticSelectFilterStore> {
    protected _store: StaticSelectFilterStore;
    protected filterAPI: FilterAPI;
    readonly dataKey: string;

    constructor(filterAPI: FilterAPI, spec: FilterSpec<string | boolean>) {
        super();
        this.filterAPI = filterAPI;
        this.dataKey = spec.dataKey;
        this._store = new StaticSelectFilterStore(
            spec.attributes,
            this.findInitFilter(filterAPI.sharedInitFilter, this.dataKey)
        );
    }

    get store(): StaticSelectFilterStore {
        return this._store;
    }
}
