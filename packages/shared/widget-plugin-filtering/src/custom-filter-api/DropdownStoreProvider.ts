import { ListAttributeValue } from "mendix";
import { FilterAPI } from "../context";
import { StaticSelectFilterStore } from "../stores/picker/StaticSelectFilterStore";
import { PickerFilterStore } from "../typings/PickerFilterStore";
import { BaseStoreProvider } from "./BaseStoreProvider";
import { FilterSpec } from "./typings";

export class DropdownStoreProvider extends BaseStoreProvider<StaticSelectFilterStore> {
    protected _store: StaticSelectFilterStore;
    protected filterAPI: FilterAPI;
    readonly dataKey: string;

    constructor(filterAPI: FilterAPI, spec: FilterSpec<string>) {
        super();
        this.filterAPI = filterAPI;
        this.dataKey = spec.dataKey;

        // Convert AttributeMetaData to ListAttributeValue
        const attributes = spec.attributes.map(attr => {
            const defaultFormatter = {
                format: (value: any) => String(value),
                parse: (value: string) => ({ valid: true, value })
            };

            return {
                ...attr,
                isList: false,
                get: (obj: any) => obj[attr.id],
                formatter: defaultFormatter
            } as ListAttributeValue;
        });

        this._store = new StaticSelectFilterStore(
            attributes,
            this.findInitFilter(filterAPI.sharedInitFilter, this.dataKey)
        );
    }

    get store(): PickerFilterStore {
        return this._store;
    }
}
