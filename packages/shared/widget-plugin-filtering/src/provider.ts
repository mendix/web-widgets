import { Context, createContext, Dispatch, SetStateAction, useState, useContext } from "react";
import type { ListAttributeValue, ListReferenceSetValue, ListReferenceValue, ListValue, ObjectItem } from "mendix";
import type { FilterCondition, LiteralExpression } from "mendix/filters";
import { OutOfContextError, ValueIsMissingError } from "./errors.js";
import { Result, value, error } from "./result-meta.js";

export type BinaryExpression<T = FilterCondition> = T extends { arg1: unknown; arg2: object } ? T : never;
export type FilterFunction = BinaryExpression["name"];
export type ListAttributeId = ListAttributeValue["id"];
export type InitialFilterProps = { type: FilterFunction; value: LiteralExpression["value"] };

export enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date",
    ASSOCIATION = "association"
}

export interface FilterState {
    getFilterCondition: () => FilterCondition | undefined;
    filterType?: FilterType;
}

export interface AssociationProperties {
    association: ListReferenceValue | ListReferenceSetValue;
    optionsSource: ListValue;
    getOptionLabel: (item: ObjectItem) => string;
}

export type DispatchFilterUpdate = Dispatch<FilterState>;

export interface FilterContextValue {
    filterDispatcher: DispatchFilterUpdate;
    singleAttribute?: ListAttributeValue;
    singleInitialFilter?: InitialFilterProps[];
    multipleAttributes?: { [id: ListAttributeId]: ListAttributeValue };
    multipleInitialFilters?: { [id: ListAttributeId]: InitialFilterProps[] };
    associationProperties?: AssociationProperties;
}

type FilterContextObject = Context<FilterContextValue | undefined>;

const CONTEXT_OBJECT_PATH = "com.mendix.widgets.web.filterable.filterContext" as const;

declare global {
    interface Window {
        [CONTEXT_OBJECT_PATH]: FilterContextObject | undefined;
    }
}

/**
 * @deprecated Please use getGlobalFilterContextObject
 */
export function getFilterDispatcher(): Context<FilterContextValue> | undefined {
    return (window as any)[CONTEXT_OBJECT_PATH] as Context<FilterContextValue>;
}

/**
 * @deprecated Please use getGlobalFilterContextObject
 */
export function useFilterContext(): {
    FilterContext: Context<FilterContextValue>;
} {
    const globalFilterContext = getFilterDispatcher();
    if (globalFilterContext) {
        return { FilterContext: globalFilterContext };
    }

    const FilterContext = createContext(undefined as any as FilterContextValue);

    (window as any)[CONTEXT_OBJECT_PATH] = FilterContext;
    return { FilterContext };
}

export function getGlobalFilterContextObject(): FilterContextObject {
    let contextObject = window[CONTEXT_OBJECT_PATH];

    if (contextObject == null) {
        contextObject = createContext<FilterContextValue | undefined>(undefined);
        window[CONTEXT_OBJECT_PATH] = contextObject;
    }

    return contextObject;
}

export function useFilterContextValue(): Result<FilterContextValue, OutOfContextError> {
    const context = getGlobalFilterContextObject();
    const contextValue = useContext(context);

    if (contextValue == null) {
        return error(new OutOfContextError());
    }

    return value(contextValue);
}

export function getFilterAssociationProps(
    contextValue: FilterContextValue
): Result<AssociationProperties, ValueIsMissingError> {
    if (contextValue.associationProperties == null) {
        return error(new ValueIsMissingError("referenceProperties is undefined"));
    }

    return value(contextValue.associationProperties);
}

export function useMultipleFiltering(): Record<
    FilterType,
    [FilterState | undefined, Dispatch<SetStateAction<FilterState | undefined>>]
> {
    return {
        [FilterType.STRING]: useState(),
        [FilterType.NUMBER]: useState(),
        [FilterType.DATE]: useState(),
        [FilterType.ENUMERATION]: useState(),
        [FilterType.ASSOCIATION]: useState()
    };
}
