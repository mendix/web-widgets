import { FilterAPI } from "../context";
import { BaseStoreProvider } from "./BaseStoreProvider";
import { FilterSpec } from "./typings";
import { NumberInputFilterStore } from "../stores/input/NumberInputFilterStore";
import { Number_InputFilterInterface } from "../typings/InputFilterInterface";

export class NumberStoreProvider extends BaseStoreProvider<NumberInputFilterStore> {
    protected _store: NumberInputFilterStore;
    protected filterAPI: FilterAPI;
    readonly dataKey: string;

    constructor(filterAPI: FilterAPI, spec: FilterSpec<Big>) {
        super();
        this.filterAPI = filterAPI;
        this.dataKey = spec.dataKey;
        this._store = new NumberInputFilterStore(spec.attributes, null);
    }

    get store(): Number_InputFilterInterface {
        return this._store;
    }
}
