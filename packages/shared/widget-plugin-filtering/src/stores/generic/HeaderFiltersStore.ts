import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { computed, makeObservable } from "mobx";
import { FilterAPI } from "../../context";
import { APIError } from "../../errors";
import { LegacyPv } from "../../providers/LegacyPv";
import { Result, value } from "../../result-meta";
import { FilterObserver } from "../../typings/FilterObserver";
import { FiltersSettingsMap } from "../../typings/settings";

export interface FilterListType {
    filter: ListAttributeValue<string | Big | boolean | Date>;
}

export interface HeaderFiltersStoreSpec {
    filterList: FilterListType[];
    filterChannelName: string;
    headerInitFilter: Array<FilterCondition | undefined>;
    sharedInitFilter: Array<FilterCondition | undefined>;
    filterObserver: FilterObserver;
}

export class HeaderFiltersStore {
    private provider: Result<LegacyPv, APIError>;
    context: FilterAPI;

    constructor({
        filterList,
        filterChannelName,
        headerInitFilter,
        sharedInitFilter,
        filterObserver
    }: HeaderFiltersStoreSpec) {
        this.provider = this.createProvider(filterList, headerInitFilter);
        this.context = {
            version: 3,
            parentChannelName: filterChannelName,
            provider: this.provider,
            sharedInitFilter,
            filterObserver
        };
        makeObservable(this, {
            conditions: computed,
            settings: computed
        });
    }

    get conditions(): Array<FilterCondition | undefined> {
        return this.provider.hasError ? [] : this.provider.value.conditions;
    }

    get settings(): FiltersSettingsMap<string> {
        return this.provider.hasError ? new Map() : this.provider.value.settings;
    }

    set settings(value: FiltersSettingsMap<string> | undefined) {
        if (this.provider.hasError) {
            return;
        }

        this.provider.value.settings = value;
    }

    createProvider(
        filterList: FilterListType[],
        initFilter: Array<FilterCondition | undefined>
    ): Result<LegacyPv, APIError> {
        return value(
            new LegacyPv(
                filterList.map(f => f.filter),
                initFilter
            )
        );
    }

    setup(): (() => void) | void {
        if (this.provider.hasError) {
            return;
        }

        return this.provider.value.setup();
    }
}
