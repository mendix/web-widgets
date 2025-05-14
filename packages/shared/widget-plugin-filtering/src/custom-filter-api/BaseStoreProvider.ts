import { isAnd, isTag } from "@mendix/filter-commons/condition-utils";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ISetupable } from "@mendix/widget-plugin-mobx-kit/setupable";
import { FilterCondition } from "mendix/filters";
import { FilterAPI } from "../context";
import { Filter } from "../typings/observable-filter-host";

export abstract class BaseStoreProvider<S extends Filter> implements ISetupable {
    protected abstract _store: S;
    protected abstract filterAPI: FilterAPI;
    abstract readonly dataKey: string;

    protected findInitFilter(conditions: Array<FilterCondition | undefined>, key: string): FilterCondition | null {
        for (const cond of conditions) {
            if (cond && isAnd(cond)) {
                const [tag, initFilter] = cond.args;
                if (isTag(tag) && tag.arg1.value === key) {
                    return initFilter;
                }
            }
        }
        return null;
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        this.filterAPI.filterObserver.observe(this.dataKey, this._store);
        add(() => this.filterAPI.filterObserver.unobserve(this.dataKey));
        add(this._store.setup?.());
        return disposeAll;
    }
}
