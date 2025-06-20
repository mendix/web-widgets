import { AttributeMetaData, DynamicValue } from "mendix";
import { SortOrderStore } from "../stores/SortOrderStore";
import { SortStoreHost } from "../stores/SortStoreHost";
import { SortInstruction } from "../types/store";

interface SortStoreProviderSpec {
    host: SortStoreHost;
    initSortOrder?: SortInstruction[];
    attributes: Array<{
        attribute: AttributeMetaData;
        caption?: DynamicValue<string>;
    }>;
}

export class SortStoreProvider {
    private _host: SortStoreHost;
    store: SortOrderStore;

    constructor(spec: SortStoreProviderSpec) {
        this._host = spec.host;
        const options = spec.attributes.map(item => ({
            value: item.attribute.id,
            caption: item.caption?.value ?? "empty"
        }));
        this.store = new SortOrderStore({ options, initSortOrder: spec.initSortOrder });
    }

    setup(): () => void {
        this._host.observe(this.store);
        return () => this._host.unobserve();
    }
}
