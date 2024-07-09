import {
    AssociationProperties,
    ComboboxFilterInterface,
    FilterContextValue,
    FilterState,
    InputFilterInterface,
    attrgroupFilterStore,
    readInitFilterValues
} from "@mendix/widget-plugin-filtering";
import { ensure } from "@mendix/widget-plugin-platform/utils/ensure";
import { Big } from "big.js";
import { ListAttributeValue, ListExpressionValue, ListReferenceSetValue, ListReferenceValue, ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { ReactNode } from "react";
import { ColumnsType } from "../../../../typings/DatagridProps";

export interface IColumnFilterStore {
    setFilterState(newState: FilterState | undefined): void;

    needsFilterContext: boolean;

    getFilterContextProps(): Pick<
        FilterContextValue,
        "singleAttribute" | "associationProperties" | "singleInitialFilter"
    >;

    renderFilterWidgets(): ReactNode;
}

export class ColumnFilterStore implements IColumnFilterStore {
    private filterState: FilterState | undefined = undefined;

    private _attribute?: ListAttributeValue<string | Big | boolean | Date>;
    private _filter?: ReactNode;
    private _filterAssociation?: ListReferenceValue | ListReferenceSetValue;
    private _filterAssociationOptions?: ListValue;
    private _filterAssociationOptionLabel?: ListExpressionValue<string>;

    private filterStore: InputFilterInterface | ComboboxFilterInterface | null = null;

    constructor(props: ColumnsType, private initialFilters: FilterCondition | undefined) {
        if (props.filterAssociationOptions) {
            props.filterAssociationOptions.setLimit(0);
        }
        this.updateProps(props);

        if (this._attribute) {
            this.filterStore = attrgroupFilterStore(this._attribute.type, [this._attribute]);
            (document as any)["__dg2__filter" + this._attribute.type] = this.filterStore;
            const s = this.filterStore;
            if (s && s.controlType === "input") {
                autorun(() => {
                    console.log("val", s?.arg1.value);
                    console.log("cond", s.filterCondition);
                });
            }
        }

        makeObservable<
            ColumnFilterStore,
            | "filterState"
            | "_attribute"
            | "_filter"
            | "_filterAssociation"
            | "_filterAssociationOptions"
            | "_filterAssociationOptionLabel"
        >(this, {
            _attribute: observable.ref,
            _filter: observable.ref,
            _filterAssociation: observable.ref,
            _filterAssociationOptions: observable.ref,
            _filterAssociationOptionLabel: observable.ref,

            condition: computed.struct,

            filterState: observable.ref,
            setFilterState: action,
            updateProps: action
        });
    }

    updateProps(props: ColumnsType): void {
        this._attribute = props.attribute;
        this._filter = props.filter;
        this._filterAssociation = props.filterAssociation;
        this._filterAssociationOptions = props.filterAssociationOptions;
        this._filterAssociationOptionLabel = props.filterAssociationOptionLabel;
    }

    get needsFilterContext(): boolean {
        return !!this._attribute || !!this._filterAssociation;
    }

    renderFilterWidgets(): ReactNode {
        return this._filter;
    }

    getFilterContextProps(): Pick<
        FilterContextValue,
        "singleAttribute" | "associationProperties" | "singleInitialFilter" | "store"
    > {
        return {
            store: this.filterStore,
            singleAttribute: this._attribute,
            singleInitialFilter: readInitFilterValues(this._attribute, this.initialFilters),
            associationProperties: this.getColumnAssociationProps()
        } as any;
    }

    private getColumnAssociationProps(): AssociationProperties | undefined {
        if (!this._filterAssociation) {
            return;
        }

        const association = ensure(this._filterAssociation, errorMessage("filterAssociation"));
        const optionsSource = ensure(this._filterAssociationOptions, errorMessage("filterAssociationOptions"));
        const labelSource = ensure(this._filterAssociationOptionLabel, errorMessage("filterAssociationOptionLabel"));

        return {
            association,
            optionsSource,
            getOptionLabel: item => labelSource.get(item).value ?? "Error: unable to get caption"
        };
    }

    setFilterState(newState: FilterState | undefined): void {
        this.filterState = newState;
    }

    get condition2(): FilterCondition | undefined {
        return this.filterStore ? this.filterStore.filterCondition : undefined;
    }

    get condition(): FilterCondition | undefined {
        if (!this.filterState) {
            return undefined;
        }

        return this.filterState.getFilterCondition();
    }
}

const errorMessage = (propName: string): string =>
    `Can't map ColumnsType to AssociationProperties: ${propName} is undefined`;
