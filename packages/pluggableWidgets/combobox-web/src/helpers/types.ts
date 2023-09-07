import { ReactNode } from "react";
import { ComboboxContainerProps, FilterTypeEnum, SelectedItemsStyleEnum } from "../../typings/ComboboxProps";

export type Status = "unavailable" | "loading" | "available";
export type SelectorType = "single" | "multi";
export type SelectionType = SingleSelector | MultiSelector;

export interface CaptionsProvider {
    get(value: string | null): string;
    render(value: string | null): ReactNode;
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

interface SelectorBase<SelectorType, T> {
    updateProps(props: ComboboxContainerProps): void;
    status: Status;
    type: SelectorType;
    readOnly: boolean;

    // options related
    options: OptionsProvider;

    // caption related
    caption: CaptionsProvider;

    // value related
    clearable: boolean;

    currentValue: T | null;
    setValue(value: T | null): void;
}

export interface SingleSelector extends SelectorBase<"single", string> {}
export interface MultiSelector extends SelectorBase<"multi", string[]> {
    selectedItemsStyle: SelectedItemsStyleEnum;
}

export interface SelectionBaseProps<SelectionType> {
    selector: SelectionType;
    tabIndex: number;
    inputId: string;
    labelId?: string;
    noOptionsText?: string;
}
