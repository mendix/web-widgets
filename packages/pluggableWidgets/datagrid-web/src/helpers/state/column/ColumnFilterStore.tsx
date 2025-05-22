import { FilterAPI, getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";
import { InputFilterStore, attrgroupFilterStore } from "@mendix/widget-plugin-filtering/stores/input/store-utils";
import { FilterData } from "@mendix/filter-commons/typings/settings";
import { value } from "@mendix/widget-plugin-filtering/result-meta";
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

type FilterStore = InputFilterStore | StaticSelectFilterStore;

const { Provider } = getGlobalFilterContextObject();

export class ColumnFilterStore implements IColumnFilterStore {
    private _widget: ReactNode;
    private _filterStore: FilterStore | null = null;
    private _context: FilterAPI;
    private _observerBag: ObserverBag;

    constructor(props: ColumnsType, info: StaticInfo, dsViewState: FilterCondition | null, observerBag: ObserverBag) {
        this._observerBag = observerBag;
        this._widget = props.filter;
        this._filterStore = this.createFilterStore(props, dsViewState);
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

    private createFilterStore(props: ColumnsType, dsViewState: FilterCondition | null): FilterStore | null {
        if (isListAttributeValue(props.attribute)) {
            return attrgroupFilterStore(props.attribute.type, [props.attribute], dsViewState);
        }

        return null;
    }

    private createContext(store: FilterStore | null, info: StaticInfo): FilterAPI {
        return {
            version: 3,
            parentChannelName: info.filtersChannelName,
            provider: value({
                type: "direct",
                store
            }),
            filterObserver: this._observerBag.customFilterHost,
            sharedInitFilter: this._observerBag.sharedInitFilter
        };
    }

    renderFilterWidgets(): ReactNode {
        return <Provider value={this._context}>{this._widget}</Provider>;
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

export interface ObserverBag {
    customFilterHost: ObservableFilterHost;
    sharedInitFilter: Array<FilterCondition | undefined>;
}
