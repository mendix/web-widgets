import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { ListAttributeValue, ListExpressionValue, ListValue } from "mendix";
import { ReactNode } from "react";
import {
    ComboboxContainerProps,
    FilterTypeEnum,
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum,
    ReadOnlyStyleEnum,
    SelectedItemsSortingEnum,
    SelectedItemsStyleEnum,
    SelectionMethodEnum
} from "../../typings/ComboboxProps";

export type Status = "unavailable" | "loading" | "available";
export type CaptionPlacement = "label" | "options";
export type SelectionType = "single" | "multi";
export type Selector = SingleSelector | MultiSelector;
export type SortOrder = "asc" | "desc";

export interface CaptionsProvider {
    get(value: string | null): string;
    render(value: (string | null) | (number | null), placement?: CaptionPlacement, htmlFor?: string): ReactNode;
    emptyCaption: string;
    formatter?: ListExpressionValue<string> | ListAttributeValue<string>;
}
export interface ValuesProvider<T> {
    get(key: string | null): T | undefined;
}

export interface OptionsProvider<T = unknown, P = object> {
    status: Status;
    filterType: FilterTypeEnum;
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
    updateProps(props: ComboboxContainerProps): void;
    status: Status;
    attributeType?: "string" | "big" | "boolean" | "date";
    selectorType?: "context" | "database" | "static";
    type: T;
    readOnly: boolean;
    lazyLoading?: boolean;
    loadingType?: LoadingTypeEnum;
    validation?: string;

    // options related
    options: OptionsProvider;

    // caption related
    caption: CaptionsProvider;

    // value related
    clearable: boolean;

    currentId: V | null;
    setValue(value: V | null): void;

    customContentType: OptionsSourceAssociationCustomContentTypeEnum;

    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;
}

export interface SingleSelector extends SelectorBase<"single", string> {}
export interface MultiSelector extends SelectorBase<"multi", string[]> {
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectionMethod: SelectionMethodEnum;
    selectAllButton: boolean;
    selectedItemsSorting: SelectedItemsSortingEnum;
    getOptions(): string[];
    isOptionsSelected(): ThreeStateCheckBoxEnum;
}
export interface SelectionBaseProps<Selector> {
    inputId: string;
    labelId?: string;
    noOptionsText?: string;
    readOnlyStyle: ReadOnlyStyleEnum;
    keepMenuOpen?: boolean;
    selector: Selector;
    menuFooterContent?: ReactNode;
    tabIndex: number;
    ariaRequired: boolean;
    a11yConfig: {
        ariaLabels: {
            clearSelection: string;
            removeSelection: string;
            selectAll: string;
        };
        a11yStatusMessage: A11yStatusMessage;
    };
}

export interface A11yStatusMessage {
    a11ySelectedValue: string;
    a11yOptionsAvailable: string;
    a11yInstructions: string;
    a11yNoOption: string;
}
