import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { computed, makeObservable } from "mobx";
import { FilterAPIv2 } from "../../context";
import { APIError } from "../../errors";
import { LegacyPv } from "../../providers/LegacyPv";
import { Result, value } from "../../result-meta";
import { FiltersSettingsMap } from "../../typings/settings";

export interface FilterListType {
    filter: ListAttributeValue<string | Big | boolean | Date>;
}

export interface HeaderFiltersStoreProps {
    filterList: FilterListType[];
    parentChannelName?: string;
}

export interface StaticInfo {
    name: string;
    filtersChannelName: string;
}

export class HeaderFiltersStore {
    private provider: Result<LegacyPv, APIError>;
    context: FilterAPIv2;

    constructor(
        props: HeaderFiltersStoreProps,
        info: StaticInfo,
        dsViewState: Array<FilterCondition | undefined> | null
    ) {
        this.provider = this.createProvider(props, dsViewState);
        this.context = {
            version: 2,
            parentChannelName: info.filtersChannelName ?? "",
            provider: this.provider
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
        props: HeaderFiltersStoreProps,
        dsViewState: Array<FilterCondition | undefined> | null
    ): Result<LegacyPv, APIError> {
        return value(
            new LegacyPv(
                props.filterList.map(f => f.filter),
                dsViewState
            )
        );
    }

    setup(): (() => void) | void {
        if (this.provider.hasError) {
            return;
        }

        return this.provider.value.setup();
    }

    updateProps(): void {}
}
