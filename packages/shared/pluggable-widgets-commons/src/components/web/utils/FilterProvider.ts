import { Context, createContext, Dispatch, SetStateAction, useState, useContext } from "react";
import { ListAttributeValue, ListReferenceSetValue, ListReferenceValue, ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { OutOfContextError, ValueIsMissingError } from "./errors";

export type FilterValue = { type: string; value: any };

export const enum FilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date"
}

export interface FilterFunction {
    getFilterCondition: () => FilterCondition | undefined;
    filterType?: FilterType;
}

export interface ReferenceProperties {
    referenceToMatch: ListReferenceValue | ListReferenceSetValue;
    referenceOptionsSource: ListValue;
    referenceAttribute: ListAttributeValue<string>;
}

export interface FilterContextValue {
    filterDispatcher: Dispatch<FilterFunction>;
    singleAttribute?: ListAttributeValue;
    multipleAttributes?: { [id: string]: ListAttributeValue };
    singleInitialFilter?: FilterValue[];
    multipleInitialFilters?: { [id: string]: FilterValue[] };
    referenceProperties?: ReferenceProperties;
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

type ContextValueMeta =
    | {
          hasError: true;
          error: OutOfContextError;
      }
    | { hasError: false; value: FilterContextValue };

export function useFilterContextValue(): ContextValueMeta {
    const context = getGlobalFilterContextObject();
    const value = useContext(context);

    if (value === undefined) {
        return { hasError: true, error: new OutOfContextError() };
    }

    return { hasError: false, value };
}

type ReferencePropertiesValueMeta =
    | {
          hasError: true;
          error: ValueIsMissingError;
      }
    | {
          hasError: false;
          value: ReferenceProperties;
      };
export function readReferenceProperties(contextValue: FilterContextValue): ReferencePropertiesValueMeta {
    if (!contextValue.referenceProperties) {
        return { hasError: true, error: new ValueIsMissingError("referenceProperties is undefined") };
    }

    return { hasError: false, value: contextValue.referenceProperties };
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
