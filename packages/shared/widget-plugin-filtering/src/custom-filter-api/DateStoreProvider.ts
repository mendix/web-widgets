import { FilterAPI } from "../context";
import { DateInputFilterStore } from "../stores/input/DateInputFilterStore";
import { Date_InputFilterInterface } from "../typings/InputFilterInterface";
import { BaseStoreProvider } from "./BaseStoreProvider";
import { FilterSpec } from "./typings";

export class DateStoreProvider extends BaseStoreProvider<DateInputFilterStore> {
    protected _store: DateInputFilterStore;
    protected filterAPI: FilterAPI;
    readonly dataKey: string;

    constructor(filterAPI: FilterAPI, spec: FilterSpec<Date>) {
        super();
        this.filterAPI = filterAPI;
        this.dataKey = spec.dataKey;
        this._store = new DateInputFilterStore(
            spec.attributes,
            this.findInitFilter(filterAPI.sharedInitFilter, this.dataKey)
        );
    }

    get store(): Date_InputFilterInterface {
        return this._store;
    }
}
