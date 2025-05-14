import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ISetupable } from "@mendix/widget-plugin-mobx-kit/setupable";
import { AttributeMetaData, DynamicValue } from "mendix";
import { ObservableSortStore, ObservableSortStoreHost } from "../ObservableSortStoreHost";
import { SortingStore } from "../stores/SortingStore";

interface Option {
    attribute: AttributeMetaData;
    caption?: DynamicValue<string>;
}

interface SortStoreProviderSpec {
    options: Option[];
    name: string;
}

export class SortStoreProvider implements ISetupable {
    private readonly _store: ObservableSortStore;
    private readonly _host: ObservableSortStoreHost;
    private readonly _key: string;

    constructor(host: ObservableSortStoreHost, spec: SortStoreProviderSpec) {
        this._key = spec.name;
        this._host = host;
        const storeOptions = spec.options.map(option => ({
            value: option.attribute.id,
            caption: option.caption?.value ?? ""
        }));
        this._store = new SortingStore(storeOptions, []);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        this._host.observe(this._key, this._store);
        add(() => this._host.unobserve(this._key));
        add(this._store.setup?.());
        return disposeAll;
    }
}
