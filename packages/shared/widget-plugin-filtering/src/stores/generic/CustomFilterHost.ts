import { reduceMap, restoreMap } from "@mendix/filter-commons/condition-utils";
import { FilterData, FiltersSettingsMap, PlainJs, Serializable } from "@mendix/filter-commons/typings/settings";
import { FilterCondition } from "mendix/filters";
import { action, autorun, makeAutoObservable } from "mobx";
import { Filter, ObservableFilterHost } from "../../typings/ObservableFilterHost";
import { ConditionWithMeta } from "./CombinedFilter";

export class CustomFilterHost implements ObservableFilterHost, Serializable {
    private filters: Map<string, [store: Filter, dispose: () => void]> = new Map();
    private settingsBuffer: FiltersSettingsMap<string> = new Map();
    private _state: Map<string, FilterCondition | undefined> = new Map();

    readonly metaKey = "custom-filter-host";

    constructor() {
        makeAutoObservable(this, {
            hydrate: action
        });
    }

    get settings(): FiltersSettingsMap<string> {
        return new Map([...this.filters].map(([key, [filter]]) => [key, filter.toJSON()]));
    }

    set settings(data: FiltersSettingsMap<string>) {
        this.settingsBuffer = data;
    }

    observe(key: string, filter: Filter): void {
        this.unobserve(key);
        const clearSettingsSync = autorun(() => {
            if (this.settingsBuffer.has(key)) {
                filter.fromJSON(this.settingsBuffer.get(key));
            }
        });
        const clearStateSync = autorun(() => {
            this._state.set(key, filter.condition);
        });
        const skipInit = this.settingsBuffer.has(key);
        if (!skipInit && this._state.has(key)) {
            filter.fromViewState(this._state.get(key)!);
        }

        const dispose = (): void => {
            clearSettingsSync();
            clearStateSync();
            this.filters.delete(key);
            this._state.delete(key);
        };
        this.filters.set(key, [filter, dispose]);
    }

    unobserve(key: string): void {
        if (this.filters.has(key)) {
            this.filters.get(key)?.[1]();
        }
    }

    toJSON(): PlainJs {
        return [...this.settings.entries()] as PlainJs;
    }

    fromJSON(data: PlainJs): void {
        if (data == null || !Array.isArray(data)) {
            return;
        }

        this.settings = new Map(data as Array<[string, FilterData]>);
    }

    get condWithMeta(): ConditionWithMeta {
        const conditions: Record<string, FilterCondition | undefined> = {};

        for (const [key, [filter]] of this.filters) {
            conditions[key] = filter.condition;
        }

        const [cond, meta] = reduceMap(conditions);

        return {
            cond,
            meta
        };
    }

    hydrate({ cond, meta }: ConditionWithMeta): void {
        const map = restoreMap(cond, meta);
        this._state = new Map(Object.entries(map));
    }
}
