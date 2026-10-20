import classNames from "classnames";
import { CSSProperties, ReactElement } from "react";
import { DatePicker, DatePickerProps } from "./DatePicker";
import { Date_InputFilterInterface, FilterFn } from "../../typings/InputFilterInterface";
import { FilterSelector } from "../filter-selector/FilterSelector";

export type DateFilterFn = FilterFn<Date_InputFilterInterface>;

export interface DateFilterComponentProps extends DatePickerProps {
    id?: string;
    class: string;
    tabIndex?: number;
    style?: CSSProperties;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
    filterFn?: DateFilterFn;
    onFilterChange: (fn: DateFilterFn) => void;
}

export type DateFilterComponent = typeof DateFilterComponent;

export function DateFilterComponent(props: DateFilterComponentProps): ReactElement {
    return (
        <div
            className={classNames("filter-container", props.class)}
            data-focusindex={props.tabIndex}
            style={props.style}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption ?? "Select filter type"}
                    value={props.filterFn ?? "equal"}
                    onSelect={props.onFilterChange}
                    options={OPTIONS}
                />
            )}
            <DatePicker {...props} />
        </div>
    );
}

const OPTIONS = [
    { value: "between", label: "Between" },
    { value: "greater", label: "Greater than" },
    { value: "greaterEqual", label: "Greater than or equal" },
    { value: "equal", label: "Equal" },
    { value: "notEqual", label: "Not equal" },
    { value: "smaller", label: "Smaller than" },
    { value: "smallerEqual", label: "Smaller than or equal" },
    { value: "empty", label: "Empty" },
    { value: "notEmpty", label: "Not empty" }
] as Array<{ value: DateFilterFn; label: string }>;
