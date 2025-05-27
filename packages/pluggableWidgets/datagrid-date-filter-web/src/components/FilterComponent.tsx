import { FilterSelector } from "@mendix/widget-plugin-filtering/controls";
import classNames from "classnames";
import { createElement, ReactElement } from "react";
import { FilterTypeEnum } from "../helpers/base-types";
import { DatePicker, DatePickerProps } from "./DatePicker";

export interface FilterComponentProps extends DatePickerProps {
    id?: string;
    class: string;
    tabIndex?: number;
    style?: React.CSSProperties;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
    filterFn?: FilterTypeEnum;
    onFilterChange: (fn: FilterTypeEnum) => void;
}

export type FilterComponent = typeof FilterComponent;

export function FilterComponent(props: FilterComponentProps): ReactElement {
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
] as Array<{ value: FilterTypeEnum; label: string }>;
