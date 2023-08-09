import { ReactNode } from "react";
import { ComboboxContainerProps, FilterTypeEnum } from "../../typings/ComboboxProps";

export type Status = "unavailable" | "loading" | "available";

export interface CaptionsProvider {
    get(value: string | null): string;
    render(value: string | null): ReactNode;
    emptyCaption: string;
}

export interface OptionsProvider<T = unknown, P = {}> {
    status: Status;
    filterType: FilterTypeEnum;

    getAll(sortType?: FilterTypeEnum): string[];

    // search related
    setSearchTerm(term: string): void;

    // lazy loading related
    hasMore: boolean;
    loadMore(): void;

    // for private use
    _updateProps(props: P): void;
    _optionToValue(option: string | null): T | undefined;
    _valueToOption(value: T | undefined): string | null;
}

export interface Selector<T> {
    updateProps(props: ComboboxContainerProps): void;
    status: Status;
    type: "single" | "multi";
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

    // options related
    options: OptionsProvider;

    // caption related
    caption: CaptionsProvider;

    // value related
    clearable: boolean;
    currentValue: string[] | null;
    setValue(value: string[] | null): void;
}
