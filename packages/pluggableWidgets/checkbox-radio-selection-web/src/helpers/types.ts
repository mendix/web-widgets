import { DynamicValue, ListAttributeValue, ListExpressionValue, ListValue } from "mendix";
import { ReactNode } from "react";
import {
    CheckboxRadioSelectionContainerProps,
    OptionsSourceCustomContentTypeEnum,
    ReadOnlyStyleEnum
} from "../../typings/CheckboxRadioSelectionProps";

export type Status = "unavailable" | "loading" | "available";
export type SelectionType = "single" | "multi";
export type Selector = SingleSelector | MultiSelector;
export type SortOrder = "asc" | "desc";

export interface CaptionsProvider {
    get(value: string | null): string;
    render(value: (string | null) | (number | null)): ReactNode;
    emptyCaption: string;
    formatter?: ListExpressionValue<string> | ListAttributeValue<string>;
}

export interface ValuesProvider<T> {
    get(key: string | null): T | undefined;
}

export interface OptionsProvider<T = unknown, P = object> {
    status: Status;
    searchTerm: string;
    sortOrder?: SortOrder;

    getAll(): string[];
    datasourceFilter?: ListValue["filter"] | undefined;

    // search related
    setSearchTerm(term: string): void;
    onAfterSearchTermChange(callback: () => void): void;

    // lazy loading related
    hasMore?: boolean;
    loadMore?(): void;
    isLoading: boolean;

    // for private use
    _updateProps(props: P): void;
    _optionToValue(option: string | null): T | undefined;
    _valueToOption(value: T | undefined): string | null;
}

interface SelectorBase<T, V> {
    updateProps(props: CheckboxRadioSelectionContainerProps): void;
    status: Status;
    attributeType?: "string" | "big" | "boolean" | "date";
    selectorType?: "context" | "database" | "static";
    type: T;
    readOnly: boolean;
    validation?: string;

    // options related
    options: OptionsProvider;

    // caption related
    caption: CaptionsProvider;

    // value related
    clearable: boolean;

    currentId: V | null;
    setValue(value: V | null): void;

    customContentType: OptionsSourceCustomContentTypeEnum;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SingleSelector extends SelectorBase<"single", string> {
    controlType: "checkbox" | "radio";
}

export interface MultiSelector extends SelectorBase<"multi", string[]> {
    getOptions(): string[];
}

export interface SelectionBaseProps<Selector> {
    inputId: string;
    labelId?: string;
    readOnlyStyle: ReadOnlyStyleEnum;
    selector: Selector;
    tabIndex: number;
    ariaRequired: DynamicValue<boolean>;
    groupName: DynamicValue<string> | undefined;
}
