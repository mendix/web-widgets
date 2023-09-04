import { Context, createContext, Dispatch, SetStateAction, useState, useContext } from "react";
import type { ListAttributeValue, ListReferenceSetValue, ListReferenceValue, ListValue, ObjectItem } from "mendix";
import type { FilterCondition } from "mendix/filters";
import { OutOfContextError, ValueIsMissingError } from "./errors.js";
import { Result, value, error } from "./result-meta.js";

export type FilterValue = { type: string; value: any };

export enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date",
    ASSOCIATION = "association"
}

export interface FilterFunction {
    getFilterCondition: () => FilterCondition | undefined;
    filterType?: FilterType;
}

export interface AssociationProperties {
    association: ListReferenceValue | ListReferenceSetValue;
    optionsSource: ListValue;
    getOptionLabel: (item: ObjectItem) => string;
}

export type ConditionDispatch = Dispatch<FilterFunction>;

export interface FilterContextValue {
    filterDispatcher: ConditionDispatch;
    singleAttribute?: ListAttributeValue;
    multipleAttributes?: { [id: string]: ListAttributeValue };
    singleInitialFilter?: FilterValue[];
    multipleInitialFilters?: { [id: string]: FilterValue[] };
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

export function useMultipleFiltering(): {
    [key: string]: [FilterFunction | undefined, Dispatch<SetStateAction<FilterFunction | undefined>>];
} {
    return {
        [FilterType.STRING]: useState<FilterFunction>(),
        [FilterType.NUMBER]: useState<FilterFunction>(),
        [FilterType.DATE]: useState<FilterFunction>(),
        [FilterType.ENUMERATION]: useState<FilterFunction>()
    };
}
