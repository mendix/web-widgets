export type Optional<T> = T | undefined;

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
}

export type FilterList<T> = Array<{ value: T; label: string }>;

export interface InputProps<TFilterEnum> {
    onFilterChange: (type: TFilterEnum) => void;
    defaultFilter: TFilterEnum;
    filters: FilterList<TFilterEnum>;

    onInputChange: React.ChangeEventHandler<HTMLInputElement>;
    inputType: "text" | "number";
    inputDisabled?: boolean;
    inputRef?: React.RefAttributes<HTMLInputElement>["ref"];
    inputValue: string;
}

export interface InputComponentProps<TFilterEnum> extends BaseProps, InputProps<TFilterEnum> {}

export interface ValueHelper<T> {
    /** Function to map input string to value. */
    fromString(arg: string): T;
    /** Function to map value to string. */
    toString(arg: T): string;
    /** Function to compare the previous value and the new value. */
    equals(a: T, b: T): boolean;
}

export interface InputHookProps<TValue, TFilterEnum> {
    defaultFilter: TFilterEnum;
    filters: FilterList<TFilterEnum>;
    value: Optional<TValue>;
    onChange: (value: Optional<TValue>, filter: TFilterEnum) => void;
    valueHelper: ValueHelper<TValue>;
    changeDelay?: number;
    parentChannelName: string | null;
    name: string;
    inputDisabled?: (filter: TFilterEnum) => boolean;
    inputType: "text" | "number";
}
