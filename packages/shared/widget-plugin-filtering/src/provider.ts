import type { ListAttributeValue, ListReferenceSetValue, ListReferenceValue, ListValue, ObjectItem } from "mendix";
import type { FilterCondition } from "mendix/filters";
import { Context, Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import { OutOfContextError, ValueIsMissingError } from "./errors.js";
import { InitialFilterValue } from "./read-init-props.js";
import { Result, error, value } from "./result-meta.js";
import { InputFilterInterface } from "./typings/InputFilterInterface.js";
import { OptionListFilterInterface } from "./typings/OptionListFilterInterface.js";

type ListAttributeId = ListAttributeValue["id"];

type AttributeByAttrId = Record<ListAttributeId, ListAttributeValue>;

type InitValuesByAttrId = Record<ListAttributeId, InitialFilterValue[]>;

export enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date"
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
    version: 1;
    eventsChannelName?: string;
    filterDispatcher: DispatchFilterUpdate;
    singleAttribute?: ListAttributeValue;
    singleInitialFilter?: InitialFilterValue[];
    multipleAttributes?: AttributeByAttrId;
    multipleInitialFilters?: InitValuesByAttrId;
    associationProperties?: AssociationProperties;
    store: InputFilterInterface | OptionListFilterInterface<string> | null;
}

export interface FilterAPIv2 {
    version: 2;
    parentChannelName: string;
    store: InputFilterInterface | OptionListFilterInterface<string> | null;
}

type FilterContextObject = Context<FilterContextValue | FilterAPIv2 | undefined>;

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
        contextObject = createContext<FilterContextValue | FilterAPIv2 | undefined>(undefined);
        window[CONTEXT_OBJECT_PATH] = contextObject;
    }

    return contextObject;
}

export function useFilterContextValue(): Result<FilterContextValue | FilterAPIv2, OutOfContextError> {
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
        [FilterType.ENUMERATION]: useState()
    };
}
