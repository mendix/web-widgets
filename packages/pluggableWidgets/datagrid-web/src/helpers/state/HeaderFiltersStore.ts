import { FilterAPIv2 } from "@mendix/widget-plugin-filtering/context";
import { groupStoreFactory, GroupStoreProvider } from "@mendix/widget-plugin-filtering/providers/GroupStoreProvider";
import { LegacyPv } from "@mendix/widget-plugin-filtering/providers/LegacyPv";
import { Result, value } from "@mendix/widget-plugin-filtering/result-meta";
import { ListAttributeValue, ListExpressionValue, ListReferenceSetValue, ListReferenceValue, ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { computed, makeObservable } from "mobx";
import { APIError } from "@mendix/widget-plugin-filtering/errors";
import { FiltersSettingsMap } from "@mendix/widget-plugin-filtering/typings/settings";

export type TypeEnum = "attrs" | "reference";

export interface GroupListType {
    type: TypeEnum;
    key: string;
    ref?: ListReferenceValue | ListReferenceSetValue;
    refOptions?: ListValue;
    caption?: ListExpressionValue<string>;
}

export interface GroupAttrsType {
    key: string;
    attr: ListAttributeValue<string | Big | boolean | Date>;
}

export interface FilterListType {
    filter: ListAttributeValue<string | Big | boolean | Date>;
}
interface Props {
    enableFilterGroups: boolean;
    groupList: GroupListType[];
    groupAttrs: GroupAttrsType[];
    filterList: FilterListType[];
}
export class HeaderFiltersStore {
    private provider: Result<LegacyPv | GroupStoreProvider, APIError>;
    context: FilterAPIv2;

    constructor(props: Props, dsViewState: Array<FilterCondition | undefined> | null) {
        this.provider = this.createProvider(props, dsViewState);
        this.context = {
            version: 2,
            parentChannelName: "",
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
        props: Props,
        dsViewState: Array<FilterCondition | undefined> | null
    ): Result<LegacyPv | GroupStoreProvider, APIError> {
        if (props.enableFilterGroups) {
            return groupStoreFactory(props, dsViewState);
        } else {
            return value(
                new LegacyPv(
                    props.filterList.map(f => f.filter),
                    dsViewState
                )
            );
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

    updateProps(props: Props): void {
        if (this.provider.hasError) {
            return;
        }
        const provider = this.provider.value;
        if (provider instanceof GroupStoreProvider) {
            provider.updateProps(props);
        }
    }
}
