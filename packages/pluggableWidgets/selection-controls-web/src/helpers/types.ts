import { DynamicValue, ListAttributeValue, ListExpressionValue, ListValue } from "mendix";
import { ReactNode } from "react";
import {
    OptionsSourceAssociationCustomContentTypeEnum,
    ReadOnlyStyleEnum,
    SelectionControlsContainerProps
} from "../../typings/SelectionControlsProps";

export type Status = "unavailable" | "loading" | "available";
export type SelectionType = "single" | "multi";
export type Selector = SingleSelector | MultiSelector;
export type SortOrder = "asc" | "desc";

export interface CaptionsProvider {
    get(value: string | null): string;
    render(value: (string | null) | (number | null), htmlFor?: string): ReactNode;
    emptyCaption: string;
    formatter?: ListExpressionValue<string> | ListAttributeValue<string>;
}
export interface ValuesProvider<T> {
    get(key: string | null): T | undefined;
}

export interface OptionsProvider<T = unknown, P = object> {
    status: Status;
    sortOrder?: SortOrder;

    getAll(): string[];
    datasourceFilter?: ListValue["filter"] | undefined;

    // for private use
    _updateProps(props: P): void;
    _optionToValue(option: string | null): T | undefined;
    _valueToOption(value: T | undefined): string | null;
}

interface SelectorBase<T, V> {
    updateProps(props: SelectionControlsContainerProps): void;
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

    currentId: V | null;
    setValue(value: V | null): void;
    groupName: string;

    customContentType: OptionsSourceAssociationCustomContentTypeEnum;

    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;
}

export interface SingleSelector extends SelectorBase<"single", string> {}
export interface MultiSelector extends SelectorBase<"multi", string[]> {
    getOptions(): string[];
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
    ariaRequired: DynamicValue<boolean>;
    a11yConfig: {
        a11yStatusMessage: A11yStatusMessage;
    };
}

export interface A11yStatusMessage {
    a11ySelectedValue: string;
    a11yOptionsAvailable: string;
    a11yInstructions: string;
    a11yNoOption: string;
}
