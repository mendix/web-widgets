import { ReactNode } from "react";
import { action, computed, makeObservable, observable } from "mobx";
import { FilterCondition } from "mendix/filters";
import { ColumnsType } from "../../../../typings/DatagridProps";
import { ListAttributeValue, ListExpressionValue, ListReferenceSetValue, ListReferenceValue, ListValue } from "mendix";
import {
    AssociationProperties,
    FilterContextValue,
    FilterState,
    readInitFilterValues
} from "@mendix/widget-plugin-filtering";
import { ensure } from "@mendix/widget-plugin-platform/utils/ensure";
import { Big } from "big.js";

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

    constructor(props: ColumnsType, private initialFilters: FilterCondition | undefined) {
        if (props.filterAssociationOptions) {
            props.filterAssociationOptions.setLimit(0);
        }
        this.updateProps(props);
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
        "singleAttribute" | "associationProperties" | "singleInitialFilter"
    > {
        return {
            singleAttribute: this._attribute,
            singleInitialFilter: readInitFilterValues(this._attribute, this.initialFilters),
            associationProperties: this.getColumnAssociationProps()
        };
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

    get condition(): FilterCondition | undefined {
        if (!this.filterState) {
            return undefined;
        }

        return this.filterState.getFilterCondition();
    }
}

const errorMessage = (propName: string): string =>
    `Can't map ColumnsType to AssociationProperties: ${propName} is undefined`;
