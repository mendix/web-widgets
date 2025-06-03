import { FilterAPIv2, getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering/context";
import { RefFilterStore, RefFilterStoreProps } from "@mendix/widget-plugin-filtering/stores/picker/RefFilterStore";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-filtering/stores/picker/StaticSelectFilterStore";
import { InputFilterStore, attrgroupFilterStore } from "@mendix/widget-plugin-filtering/stores/input/store-utils";
import { ensure } from "@mendix/widget-plugin-platform/utils/ensure";
import { FilterCondition } from "mendix/filters";
import { ListAttributeValue, ListAttributeListValue } from "mendix";
import { action, computed, makeObservable } from "mobx";
import { ReactNode, createElement } from "react";
import { ColumnsType } from "../../../../typings/DatagridProps";
import { StaticInfo } from "../../../typings/static-info";
import { FilterData } from "@mendix/widget-plugin-filtering/typings/settings";
import { value } from "@mendix/widget-plugin-filtering/result-meta";
import { disposeFx } from "@mendix/widget-plugin-filtering/mobx-utils";
export interface IColumnFilterStore {
    renderFilterWidgets(): ReactNode;
}

type FilterStore = InputFilterStore | StaticSelectFilterStore | RefFilterStore;

const { Provider } = getGlobalFilterContextObject();

export class ColumnFilterStore implements IColumnFilterStore {
    private _widget: ReactNode;
    private _filterStore: FilterStore | null = null;
    private _context: FilterAPIv2;

    constructor(props: ColumnsType, info: StaticInfo, dsViewState: FilterCondition | null) {
        this._widget = props.filter;
        this._filterStore = this.createFilterStore(props, dsViewState);
        this._context = this.createContext(this._filterStore, info);

        makeObservable<this, "_updateStore">(this, {
            _updateStore: action,
            condition2: computed,
            updateProps: action
        });
    }

    setup(): () => void {
        const [disposers, dispose] = disposeFx();
        if (this._filterStore && "setup" in this._filterStore) {
            disposers.push(this._filterStore.setup());
        }
        return dispose;
    }

    updateProps(props: ColumnsType): void {
        this._widget = props.filter;
        this._updateStore(props);
    }

    private _updateStore(props: ColumnsType): void {
        const store = this._filterStore;

        if (store === null) {
            return;
        }

        if (store.storeType === "refselect") {
            store.updateProps(this.toRefselectProps(props));
        } else if (isListAttributeValue(props.attribute)) {
            store.updateProps([props.attribute]);
        }
    }

    private toRefselectProps(props: ColumnsType): RefFilterStoreProps {
        const searchAttrId = props.filterAssociationOptionLabelAttr?.id;
        const caption =
            props.filterCaptionType === "expression"
                ? ensure(props.filterAssociationOptionLabel, errorMessage("filterAssociationOptionLabel"))
                : ensure(props.filterAssociationOptionLabelAttr, errorMessage("filterAssociationOptionLabelAttr"));

        return {
            ref: ensure(props.filterAssociation, errorMessage("filterAssociation")),
            datasource: ensure(props.filterAssociationOptions, errorMessage("filterAssociationOptions")),
            searchAttrId,
            fetchOptionsLazy: props.fetchOptionsLazy,
            caption
        };
    }

    private createFilterStore(props: ColumnsType, dsViewState: FilterCondition | null): FilterStore | null {
        if (props.filterAssociation) {
            return new RefFilterStore(this.toRefselectProps(props), dsViewState);
        }

        if (isListAttributeValue(props.attribute)) {
            return attrgroupFilterStore(props.attribute.type, [props.attribute], dsViewState);
        }

        return null;
    }

    private createContext(store: FilterStore | null, info: StaticInfo): FilterAPIv2 {
        return {
            version: 2,
            parentChannelName: info.filtersChannelName,
            provider: value({
                type: "direct",
                store
            })
        };
    }

    renderFilterWidgets(): ReactNode {
        return <Provider value={this._context}>{this._widget}</Provider>;
    }

    get condition2(): FilterCondition | undefined {
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

const errorMessage = (propName: string): string =>
    `Can't map ColumnsType to AssociationProperties: ${propName} is undefined`;
