import { SortOrderStore } from "../stores/SortOrderStore";
import { SortStoreHost } from "../stores/SortStoreHost";
import { SortInstruction } from "../types/store";

interface SortStoreProviderSpec {
    host: SortStoreHost;
    initSortOrder?: SortInstruction[];
}

export class SortStoreProvider {
    private _host: SortStoreHost;
    store: SortOrderStore;

    constructor(spec: SortStoreProviderSpec) {
        this._host = spec.host;
        this.store = new SortOrderStore({ initSortOrder: spec.initSortOrder });
    }

    setup(): () => void {
        this._host.observe(this.store);
        return () => this._host.unobserve();
    }
}
