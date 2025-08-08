import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { FilterAPI } from "../context";
import { BaseStoreProvider } from "./BaseStoreProvider";
import { FilterSpec } from "./typings";

export class EnumStoreProvider extends BaseStoreProvider<EnumFilterStore> {
    protected _store: EnumFilterStore;
    protected filterAPI: FilterAPI;
    readonly dataKey: string;

    constructor(filterAPI: FilterAPI, spec: FilterSpec<string | boolean>) {
        super();
        this.filterAPI = filterAPI;
        this.dataKey = spec.dataKey;
        this._store = new EnumFilterStore(spec.attributes, null);
    }

    get store(): EnumFilterStore {
        return this._store;
    }
}
