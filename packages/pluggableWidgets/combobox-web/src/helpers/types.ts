import { ReactNode } from "react";
import { ComboboxContainerProps, FilterTypeEnum } from "../../typings/ComboboxProps";

export type Status = "unavailable" | "loading" | "available";

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

export interface SingleSelector {
    updateProps(props: ComboboxContainerProps): void;
    status: Status;
    type: "single";
    readOnly: boolean;

    // options related
    options: OptionsProvider;

    // caption related
    caption: CaptionsProvider;

    // value related
    clearable: boolean;
    currentValue: string | null;
    setValue(value: string | null): void;
}
export interface MultiSelector {
    updateProps(props: ComboboxContainerProps): void;
    status: Status;
    type: "multi";
    readOnly: boolean;
    selectedItemsStyle: "text" | "boxes";

    // options related
    options: OptionsProvider;

    // caption related
    caption: CaptionsProvider;

    // value related
    clearable: boolean;
    currentValue: string[] | null;
    setValue(value: string[] | null): void;
}
