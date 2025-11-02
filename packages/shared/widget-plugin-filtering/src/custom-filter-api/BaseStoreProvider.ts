import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { SetupComponent } from "@mendix/widget-plugin-mobx-kit/main";
import { FilterAPI } from "../context";
import { Filter } from "../typings/ObservableFilterHost";

export abstract class BaseStoreProvider<S extends Filter> implements SetupComponent {
    protected abstract _store: S;
    protected abstract filterAPI: FilterAPI;
    abstract readonly dataKey: string;

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        this.filterAPI.filterObserver.observe(this.dataKey, this._store);
        add(() => this.filterAPI.filterObserver.unobserve(this.dataKey));
        add(this._store.setup?.());
        return disposeAll;
    }
}
