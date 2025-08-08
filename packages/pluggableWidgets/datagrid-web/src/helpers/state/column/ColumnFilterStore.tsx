import { FilterData } from "@mendix/filter-commons/typings/settings";
import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { FilterAPI, getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { APIError } from "@mendix/widget-plugin-filtering/errors";
import { error, value } from "@mendix/widget-plugin-filtering/result-meta";
import { InputFilterStore, attrgroupFilterStore } from "@mendix/widget-plugin-filtering/stores/input/store-utils";
import { ObservableFilterHost } from "@mendix/widget-plugin-filtering/typings/ObservableFilterHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ListAttributeListValue, ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { computed, makeObservable } from "mobx";
import { ReactNode, createElement } from "react";
import { ColumnsType } from "../../../../typings/DatagridProps";
import { StaticInfo } from "../../../typings/static-info";

export interface IColumnFilterStore {
    renderFilterWidgets(): ReactNode;
}

type FilterStore = InputFilterStore | EnumFilterStore;

const { Provider } = getGlobalFilterContextObject();

export class ColumnFilterStore implements IColumnFilterStore {
    private _widget: ReactNode;
    private _error: APIError | null;
    private _filterStore: FilterStore | null = null;
    private _context: FilterAPI;
    private _filterHost: ObservableFilterHost;

    constructor(props: ColumnsType, info: StaticInfo, filterHost: ObservableFilterHost) {
        this._filterHost = filterHost;
        this._widget = props.filter;
        const storeResult = this.createFilterStore(props, null);
        if (storeResult === null) {
            this._error = this._filterStore = null;
        } else if (storeResult.hasError) {
            this._error = storeResult.error;
            this._filterStore = null;
        } else {
            this._error = null;
            this._filterStore = storeResult.value;
        }
        this._context = this.createContext(this._filterStore, info);

        makeObservable<this>(this, {
            condition: computed
        });
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        if (this._filterStore && "setup" in this._filterStore) {
            add(this._filterStore.setup());
        }
        return disposeAll;
    }

    private createFilterStore(
        props: ColumnsType,
        dsViewState: FilterCondition | null
    ): ReturnType<typeof attrgroupFilterStore> | null {
        if (isListAttributeValue(props.attribute)) {
            return attrgroupFilterStore(props.attribute.type, props.attribute, dsViewState);
        }

        return null;
    }

    private createContext(store: FilterStore | null, info: StaticInfo): FilterAPI {
        return {
            version: 3,
            parentChannelName: info.filtersChannelName,
            provider: this._error
                ? error(this._error)
                : value({
                      type: "direct",
                      store
                  }),
            filterObserver: this._filterHost
        };
    }

    renderFilterWidgets(): ReactNode {
        return <Provider value={this._context}>{this._widget}</Provider>;
    }

    fromViewState(cond: FilterCondition): void {
        this._filterStore?.fromViewState(cond);
    }

    get condition(): FilterCondition | undefined {
        return this._filterStore ? this._filterStore.condition : undefined;
    }

    get settings(): FilterData | undefined {
        return this._filterStore?.toJSON();
    }

    set settings(data: FilterData | undefined) {
        if (data === undefined) {
            this._filterStore?.reset();
        } else {
            this._filterStore?.fromJSON(data);
        }
    }
}

const isListAttributeValue = (
    attribute?: ListAttributeValue | ListAttributeListValue
): attribute is ListAttributeValue => {
    return !!(attribute && attribute.isList === false);
};
