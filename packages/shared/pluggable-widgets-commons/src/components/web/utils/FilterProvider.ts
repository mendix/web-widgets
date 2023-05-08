import { Context, createContext, Dispatch, SetStateAction, useState, useContext } from "react";
import { ListAttributeValue, ListReferenceSetValue, ListReferenceValue, ListValue, ObjectItem } from "mendix";
import { FilterCondition } from "mendix/filters";
import { OutOfContextError, ValueIsMissingError } from "./errors";
import { ValueMeta, value, error } from "../../../utils/valueStatus";

export type FilterValue = { type: string; value: any };

/* eslint-disable no-unused-vars */
export const enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date",
    ASSOCIATION = "association"
}
/* eslint-enable no-unused-vars */

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

interface ProviderData {
    eventChannelName: string;
}

export interface FilterContextValue {
    filterDispatcher: ConditionDispatch;
    singleAttribute?: ListAttributeValue;
    multipleAttributes?: { [id: string]: ListAttributeValue };
    singleInitialFilter?: FilterValue[];
    multipleInitialFilters?: { [id: string]: FilterValue[] };
    associationProperties?: AssociationProperties;
    providerData?: ProviderData;
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
export function useFilterContext(): { FilterContext: Context<FilterContextValue> } {
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
    }

    return contextObject;
}

export function useFilterContextValue(): ValueMeta<FilterContextValue, OutOfContextError> {
    const context = getGlobalFilterContextObject();
    const contextValue = useContext(context);

    if (contextValue == null) {
        return error(new OutOfContextError());
    }

    return value(contextValue);
}

export function getFilterAssociationProps(
    contextValue: FilterContextValue
): ValueMeta<AssociationProperties, ValueIsMissingError> {
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
