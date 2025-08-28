// Mock implementation of main mendix module for development testing

export interface ObjectItem {
    id: string;
}

export enum ValueStatus {
    Available = "available",
    Loading = "loading",
    Unavailable = "unavailable"
}

export interface DynamicValue<T> {
    value: T;
    status: "available" | "loading" | "unavailable";
    validation?: string;
}

export interface EditableValue<T> {
    __mockType?: string; // Marker for restoration
    _triggerRerender?: () => void; // React re-render callback
    value: T;
    displayValue: string;
    status: "available" | "loading" | "unavailable";
    readonly: boolean;
    validation?: string;
    formatter: {
        format: (value: T) => string;
    };
    setValue: (value: T) => void;
}

export interface ListValue {
    status: "available" | "loading" | "unavailable";
    items?: ObjectItem[];
    totalCount?: number;
    hasMoreItems?: boolean;
    limit: number;
    offset: number;
    sortOrder: Array<[string, "asc" | "desc"]>;
    filter: any;
    setLimit: (limit: number) => void;
    setOffset: (offset: number) => void;
    setFilter: (filter: any) => void;
    setSortOrder: (sortOrder: Array<[string, "asc" | "desc"]>) => void;
    requestTotalCount: (needTotal: boolean) => void;
    reload: () => void;
}

export interface ListAttributeValue<T = any> {
    __mockType?: string; // Marker for restoration
    id: string;
    get: (item: ObjectItem) => {
        value: T;
        displayValue: string;
        status: "available" | "loading" | "unavailable";
        readonly: boolean;
        formatter: {
            format: (value: T) => string;
        };
    };
    sortable: boolean;
    filterable: boolean;
    type: string;
    validation?: string;
}

export interface ListExpressionValue<T = any> {
    __mockType?: string; // Marker for restoration
    get: (item: ObjectItem) => {
        value: T;
        displayValue: string;
        status: "available" | "loading" | "unavailable";
    };
}

export interface ListWidgetValue {
    get: (item: ObjectItem) => React.ReactElement;
}

export interface ReferenceValue {
    __mockType?: string; // Marker for restoration
    _triggerRerender?: () => void; // React re-render callback
    type: "Reference";
    value: ObjectItem | null;
    displayValue: string;
    status: "available" | "loading" | "unavailable";
    readOnly: boolean;
    validation?: string;
    formatter: {
        format: (value: ObjectItem | null) => string;
    };
    setValue: (value: ObjectItem | null) => void;
    setValidator: () => void;
}

// Type guard to check if a value is ReferenceValue
export function isReferenceValue(value: any): value is ReferenceValue {
    return value && value.type === "Reference";
}

// Type guard to check if a value is ReferenceSetValue
export function isReferenceSetValue(value: any): value is ReferenceSetValue {
    return value && value.type === "ReferenceSet";
}

export interface ReferenceSetValue {
    __mockType?: string; // Marker for restoration
    _triggerRerender?: () => void; // React re-render callback
    type: "ReferenceSet";
    value: ObjectItem[];
    displayValue: string;
    status: "available" | "loading" | "unavailable";
    readOnly: boolean;
    validation?: string;
    formatter: {
        format: (value: ObjectItem[]) => string;
    };
    setValue: (value: ObjectItem[]) => void;
    setValidator: () => void;
}

export interface SelectionSingleValue {
    selection: ObjectItem | null;
    setSelection: (selection: ObjectItem | null) => void;
}

export interface SelectionMultiValue {
    selection: ObjectItem[];
    setSelection: (selection: ObjectItem[]) => void;
}

export interface ActionValue {
    canExecute: boolean;
    isExecuting: boolean;
    execute: () => void;
}

export interface Option<T> {
    value: T;
}

// Re-export filter types
export type { FilterCondition } from "./mendix-filters";
export * from "./mendix-filters";
