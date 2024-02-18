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

    private attribute?: ListAttributeValue<string | Big | boolean | Date>;
    private filter?: ReactNode;
    private filterAssociation?: ListReferenceValue | ListReferenceSetValue;
    private filterAssociationOptions?: ListValue;
    private filterAssociationOptionLabel?: ListExpressionValue<string>;

    constructor(props: ColumnsType, private initialFilters: FilterCondition | undefined) {
        this.updateProps(props);
        makeObservable<
            ColumnFilterStore,
            | "filterState"
            | "attribute"
            | "filter"
            | "filterAssociation"
            | "filterAssociationOptions"
            | "filterAssociationOptionLabel"
        >(this, {
            attribute: observable,
            filter: observable,
            filterAssociation: observable,
            filterAssociationOptions: observable,
            filterAssociationOptionLabel: observable,

            condition: computed,

            filterState: observable.ref,
            setFilterState: action
        });
    }

    updateProps(props: ColumnsType): void {
        this.attribute = props.attribute;
        this.filter = props.filter;
        this.filterAssociation = props.filterAssociation;
        this.filterAssociationOptions = props.filterAssociationOptions;
        this.filterAssociationOptionLabel = props.filterAssociationOptionLabel;
    }

    get needsFilterContext(): boolean {
        return !!this.attribute || !!this.filterAssociation;
    }

    renderFilterWidgets(): ReactNode {
        return this.filter;
    }

    getFilterContextProps(): Pick<
        FilterContextValue,
        "singleAttribute" | "associationProperties" | "singleInitialFilter"
    > {
        return {
            singleAttribute: this.attribute,
            singleInitialFilter: readInitFilterValues(this.attribute, this.initialFilters),
            associationProperties: this.getColumnAssociationProps()
        };
    }

    private getColumnAssociationProps(): AssociationProperties | undefined {
        if (!this.filterAssociation) {
            return;
        }

        const association = ensure(this.filterAssociation, msg("filterAssociation"));
        const optionsSource = ensure(this.filterAssociationOptions, msg("filterAssociationOptions"));
        const labelSource = ensure(this.filterAssociationOptionLabel, msg("filterAssociationOptionLabel"));

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

const msg = (propName: string): string => `Can't map ColumnsType to AssociationProperties: ${propName} is undefined`;
