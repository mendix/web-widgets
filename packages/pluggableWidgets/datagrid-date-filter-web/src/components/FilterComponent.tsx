import { FilterSelector } from "@mendix/widget-plugin-filter-selector/FilterSelector";
import classNames from "classnames";
import { createElement, ReactElement } from "react";
import { FilterTypeEnum } from "../helpers/base-types";
import { DatePicker } from "./DatePicker";
import { SetupProps, useSetup } from "../helpers/useSetup";
import { useReset } from "../helpers/useReset";
import { SetFilterValueArgs } from "@mendix/widget-plugin-external-events/typings";
import { useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";

export interface FilterComponentProps extends SetupProps {
    name: string;
    adjustable: boolean;
    class: string;
    tabIndex: number;
    defaultFilter: FilterTypeEnum;
    style?: React.CSSProperties;
    placeholder?: string;
    parentChannelName?: string | null;
    screenReaderButtonCaption?: string;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
    defaultValue?: Date;
    defaultStartDate?: Date;
    defaultEndDate?: Date;
}

export type FilterComponent = typeof FilterComponent;

export function FilterComponent(props: FilterComponentProps): ReactElement {
    const { id, filterStore, calendarStore, datePickerController } = useSetup(props);
    useReset(props, filterStore);
    return (
        <div
            className={classNames("filter-container", props.class)}
            data-focusindex={props.tabIndex}
            style={props.style}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption ?? "Select filter type"}
                    defaultFilter={filterStore.state.filterType}
                    id={id}
                    onChange={filterStore.setType}
                    options={OPTIONS}
                />
            )}
            <DatePicker
                adjustable={props.adjustable}
                parentId={id}
                placeholder={props.placeholder}
                screenReaderCalendarCaption={props.screenReaderCalendarCaption}
                screenReaderInputCaption={props.screenReaderInputCaption}
                filterStore={filterStore}
                calendarStore={calendarStore}
                datePickerController={datePickerController}
            />
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
