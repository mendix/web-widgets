import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/provider-next";
import { LegacyPv } from "@mendix/widget-plugin-filtering/LegacyPv";
import { Result, value } from "@mendix/widget-plugin-filtering/result-meta";
import { groupStoreFactory, GroupStoreProvider } from "@mendix/widget-plugin-filtering/GroupStoreProvider";
import { computed, makeObservable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { APIError } from "@mendix/widget-plugin-filtering/errors";

type Params = Pick<DatagridContainerProps, "filterList" | "enableFilterGroups" | "groupList" | "groupAttrs">;
export class HeaderFiltersStore {
    private provider: Result<LegacyPv | GroupStoreProvider, APIError>;
    context: FilterAPIv2;

    constructor(params: Params) {
        this.provider = this.createProvider(params);
        this.context = {
            version: 2,
            parentChannelName: "",
            provider: this.provider
        };
        makeObservable(this, {
            conditions: computed
        });
    }

    get conditions(): Array<FilterCondition | undefined> {
        return this.provider.hasError ? [] : this.provider.value.conditions;
    }

    createProvider(params: Params): Result<LegacyPv | GroupStoreProvider, APIError> {
        if (params.enableFilterGroups) {
            return groupStoreFactory(params);
        } else {
            return value(new LegacyPv(params.filterList.map(f => f.filter)));
        }
    }

    setup(): void {
        if (this.provider.hasError) {
            return;
        }

        this.provider.value.setup();
    }

    dispose(): void {
        if (this.provider.hasError) {
            return;
        }
        this.provider.value.dispose?.();
    }
}
