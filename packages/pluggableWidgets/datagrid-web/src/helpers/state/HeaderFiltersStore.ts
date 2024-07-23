import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/provider-next";
import { LegacyPv } from "@mendix/widget-plugin-filtering/LegacyPv";
import { Result, value } from "@mendix/widget-plugin-filtering/result-meta";
import { groupStoreFactory, GroupStoreProvider } from "@mendix/widget-plugin-filtering/GroupStoreProvider";
import { computed, makeObservable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

export class HeaderFiltersStore {
    private provider: Result<LegacyPv | GroupStoreProvider, Error>;
    context: FilterAPIv2;

    constructor(props: Pick<DatagridContainerProps, "filterList" | "enableFilterGroups" | "groupList" | "groupAttrs">) {
        if (props.enableFilterGroups) {
            this.provider = groupStoreFactory(props);
        } else {
            this.provider = value(new LegacyPv(props.filterList.map(f => f.filter)));
        }
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
