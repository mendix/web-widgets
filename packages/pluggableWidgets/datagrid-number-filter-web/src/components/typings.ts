import { ChangeEventHandler, CSSProperties } from "react";
import { FilterType } from "../../typings/FilterType";
import { Big } from "big.js";

interface FilterProps {
    adjustable: boolean;
    defaultFilterType: FilterType;
    className?: string;
    id?: string;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderInputCaption?: string;
    tabIndex?: number;
    styles?: CSSProperties;
}

export interface FilterInputProps extends FilterProps {
    onFilterTypeClick: (type: FilterType) => void;
    onInputChange: ChangeEventHandler<HTMLInputElement>;
    inputValue: string;
    inputRef?: React.ClassAttributes<HTMLInputElement>["ref"];
    inputDisabled?: boolean;
}

export interface FilterComponentProps extends FilterProps {
    inputChangeDelay: number;
    value?: Big;
    updateFilters?: (value: Big | undefined, type: FilterType) => void;
    name: string;
    datagridChannelName?: string;
}
