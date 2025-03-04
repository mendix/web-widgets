import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { autorun, makeAutoObservable } from "mobx";
import { tag } from "../../condition-utils";
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
        return [...this.filters].map(([key, { condition }]) => {
            return condition ? and(tag(key), condition) : undefined;
        });
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
