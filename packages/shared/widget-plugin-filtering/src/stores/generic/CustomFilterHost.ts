import { tag } from "@mendix/filter-commons/condition-utils";
import { FilterData, FiltersSettingsMap, Json, Serializable } from "@mendix/filter-commons/typings/settings";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { autorun, makeAutoObservable } from "mobx";
import { Filter, ObservableFilterHost } from "../../typings/ObservableFilterHost";

export class CustomFilterHost implements ObservableFilterHost, Serializable {
    private filters: Map<string, [store: Filter, dispose: () => void]> = new Map();
    private settingsBuffer: FiltersSettingsMap<string> = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    get settings(): FiltersSettingsMap<string> {
        return new Map([...this.filters].map(([key, [filter]]) => [key, filter.toJSON()]));
    }

    set settings(data: FiltersSettingsMap<string>) {
        this.settingsBuffer = data;
    }

    get conditions(): Array<FilterCondition | undefined> {
        return [...this.filters].map(([key, [{ condition }]]) => {
            return condition ? and(tag(key), condition) : undefined;
        });
    }

    observe(key: string, filter: Filter): void {
        this.unobserve(key);
        const clear = autorun(() => {
            if (this.settingsBuffer.has(key)) {
                filter.fromJSON(this.settingsBuffer.get(key));
            }
        });
        const dispose = (): void => {
            clear();
            this.filters.delete(key);
        };
        this.filters.set(key, [filter, dispose]);
    }

    unobserve(key: string): void {
        if (this.filters.has(key)) {
            this.filters.get(key)?.[1]();
        }
    }

    toJSON(): Json {
        return [...this.settings.entries()] as Json[];
    }

    fromJSON(data: Json): void {
        if (data == null || !Array.isArray(data)) {
            return;
        }

        this.settings = new Map(data as Array<[string, FilterData]>);
    }
}
