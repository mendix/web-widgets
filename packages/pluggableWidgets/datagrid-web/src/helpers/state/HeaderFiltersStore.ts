import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/provider-next";
import { LegacyPv } from "@mendix/widget-plugin-filtering/LegacyPv";
import { computed, makeObservable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

export class HeaderFiltersStore {
    private provider: LegacyPv;
    context: FilterAPIv2;

    constructor(props: Pick<DatagridContainerProps, "filterList">) {
        this.provider = new LegacyPv(props.filterList.map(f => f.filter));
        this.context = {
            version: 2,
            parentChannelName: "",
            provider: this.provider
        };
        makeObservable(this, {
            filterConditions: computed
        });
    }

    get filterConditions(): FilterCondition[] {
        const cond = this.provider.filterCondition;
        return cond ? [cond] : [];
    }
}
