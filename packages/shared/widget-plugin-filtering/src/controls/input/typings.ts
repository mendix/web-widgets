import { InputFilterInterface } from "../../typings/InputFilterInterface";
import { InputStore } from "../../stores/InputStore";
import { AllFunctions } from "../../typings/FilterFunctions";

export interface BaseProps {
    adjustable: boolean;
    className?: string;
    id?: string;
    name: string;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderInputCaption?: string;
    styles?: React.CSSProperties;
    tabIndex?: number;
    type: "text" | "number";
    badge?: string;
}

export type FilterFnList<T> = Array<{ value: T; label: string }>;

export interface InputProps<Fn extends AllFunctions> {
    onFilterChange: (filterFn: Fn, isFromUserInteraction: boolean) => void;
    filterFn: Fn;
    filterFnList: FilterFnList<Fn>;
    inputStores: [InputStore, InputStore];
    disableInputs?: boolean;
    inputRef: React.RefAttributes<HTMLInputElement>["ref"];
    defaultValue?: string;
}

export interface InputComponentProps<Fn extends AllFunctions> extends BaseProps, InputProps<Fn> {}

export interface InputHookProps<Fn, V> {
    filters: FilterFnList<Fn>;
    defaultFilter: Fn;
    defaultValue: V | undefined;
    changeDelay?: number;
    filterStore: InputFilterInterface;
    disableInputs?: (filterFn: Fn) => boolean;
}
