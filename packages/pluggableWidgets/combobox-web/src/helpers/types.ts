import { ReactNode } from "react";
import {
    ComboboxContainerProps,
    FilterTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum,
    SelectedItemsStyleEnum
} from "../../typings/ComboboxProps";

export type Status = "unavailable" | "loading" | "available";
export type CaptionPlacement = "label" | "options";
export type SelectionType = "single" | "multi";
export type Selector = SingleSelector | MultiSelector;

export interface CaptionsProvider {
    get(value: string | null): string;
    render(value: string | null, placement?: CaptionPlacement): ReactNode;
    emptyCaption: string;
}

export interface OptionsProvider<T = unknown, P = object> {
    status: Status;
    filterType: FilterTypeEnum;
    searchTerm: string;

    getAll(): string[];

    // search related
    setSearchTerm(term: string): void;
    onAfterSearchTermChange(callback: () => void): void;

    // lazy loading related
    hasMore: boolean;
    loadMore(): void;

    // for private use
    _updateProps(props: P): void;
    _optionToValue(option: string | null): T | undefined;
    _valueToOption(value: T | undefined): string | null;
}

interface SelectorBase<T, V> {
    updateProps(props: ComboboxContainerProps): void;
    status: Status;
    type: T;
    readOnly: boolean;
    validation?: string;

    // options related
    options: OptionsProvider;

    // caption related
    caption: CaptionsProvider;

    // value related
    clearable: boolean;

    currentValue: V | null;
    setValue(value: V | null): void;

    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
}

export interface SingleSelector extends SelectorBase<"single", string> {}
export interface MultiSelector extends SelectorBase<"multi", string[]> {
    selectedItemsStyle: SelectedItemsStyleEnum;
}

export interface SelectionBaseProps<Selector> {
    selector: Selector;
    tabIndex: number;
    inputId: string;
    labelId?: string;
    noOptionsText?: string;
    clearButtonAriaLabels?: {
        clearSelection: string;
        removeSelection: string;
    };
}
