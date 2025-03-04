import { FilterCondition } from "mendix/filters";
import { Filter, FilterObserver } from "../../typings/FilterObserver";
import { FiltersSettingsMap } from "../../typings/settings";

export class CustomFilterHost implements FilterObserver {
    private filters: Map<string, Filter> = new Map();

    get settings(): FiltersSettingsMap<string> {
        return new Map([...this.filters].map(([key, filter]) => [key, filter.toJSON()]));
    }

    set settings(data: FiltersSettingsMap<string>) {
        for (const [key, value] of data) {
            this.filters.get(key)?.fromJSON(value);
        }
    }

    get conditions(): Array<FilterCondition | undefined> {
        return [...this.filters.values()].map(filter => filter.condition);
    }

    observe(key: string, filter: Filter): void {
        this.filters.set(key, filter);
    }

    unobserve(key: string): void {
        this.filters.delete(key);
    }
}
