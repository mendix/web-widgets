import { FilterAPI } from "../context";
import { StringInputFilterStore } from "../stores/input/StringInputFilterStore";
import { String_InputFilterInterface } from "../typings/InputFilterInterface";
import { BaseStoreProvider } from "./BaseStoreProvider";
import { FilterSpec } from "./typings";

export class StringStoreProvider extends BaseStoreProvider<StringInputFilterStore> {
    protected _store: StringInputFilterStore;
    protected filterAPI: FilterAPI;
    readonly dataKey: string;

    constructor(filterAPI: FilterAPI, spec: FilterSpec<string>) {
        super();
        this.filterAPI = filterAPI;
        this.dataKey = spec.dataKey;
        this._store = new StringInputFilterStore(
            spec.attributes,
            this.findInitFilter(filterAPI.sharedInitFilter, this.dataKey)
        );
    }

    get store(): String_InputFilterInterface {
        return this._store;
    }
}
