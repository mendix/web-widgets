import { FilterCondition } from "mendix/filters";
import { autorun, makeAutoObservable } from "mobx";
import { Filter, FilterObserver } from "../../typings/FilterObserver";
import { FiltersSettingsMap } from "../../typings/settings";

export class CustomFilterHost implements FilterObserver {
    private filters: Map<string, Filter> = new Map();
    private settingsBuffer: FiltersSettingsMap<string> = new Map();
    private disposeMap: Map<string, () => void> = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    get settings(): FiltersSettingsMap<string> {
        return new Map([...this.filters].map(([key, filter]) => [key, filter.toJSON()]));
    }

    set settings(data: FiltersSettingsMap<string>) {
        this.settingsBuffer = data;
    }

    get conditions(): Array<FilterCondition | undefined> {
        return [...this.filters.values()].map(filter => filter.condition);
    }

    observe(key: string, filter: Filter): void {
        const dispose = autorun(() => {
            if (this.settingsBuffer.has(key)) {
                filter.fromJSON(this.settingsBuffer.get(key));
            }
        });
        this.disposeMap.set(key, dispose);
        this.filters.set(key, filter);
    }

    unobserve(key: string): void {
        this.disposeMap.get(key)?.();
        this.disposeMap.delete(key);
        this.filters.delete(key);
    }
}
