import classNames from "classnames";
import { createElement, Fragment, ReactElement, useState } from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "./CalendarIcon";

type InheritedProps = Pick<
    ReactDatePickerProps,
    | "calendarStartDay"
    | "dateFormat"
    | "disabled"
    | "endDate"
    | "locale"
    | "onCalendarClose"
    | "onCalendarOpen"
    | "onChange"
    | "onChangeRaw"
    | "onKeyDown"
    | "selected"
    | "selectsRange"
    | "startDate"
>;
export interface DatePickerProps extends InheritedProps {
    adjustable: boolean;
    parentId?: string;
    placeholder?: string;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
    pickerRef?: React.RefObject<ReactDatePicker<undefined, undefined>>;
    expanded: boolean;
    onButtonMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
    onButtonKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

export function DatePicker(props: DatePickerProps): ReactElement {
    const staticProps = useSetup();

    return (
        <Fragment>
            <div id={staticProps.portalId} className="date-filter-container" />
            <span className="sr-only" id={`${props.parentId}-label`}>
                {props.screenReaderInputCaption}
            </span>
            <ReactDatePicker
                {...staticProps}
                ariaLabelledBy={`${props.parentId}-label`}
                allowSameDay={false}
                autoFocus={false}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={props.disabled}
                dropdownMode="select"
                enableTabLoop
                endDate={props.endDate}
                isClearable={props.selectsRange}
                onChange={props.onChange}
                onCalendarClose={props.onCalendarClose}
                onCalendarOpen={props.onCalendarOpen}
                onKeyDown={props.onKeyDown}
                placeholderText={props.placeholder}
                ref={props.pickerRef}
                selected={props.selected}
                selectsRange={props.selectsRange}
                shouldCloseOnSelect={false}
                showMonthDropdown
                showPopperArrow={false}
                showYearDropdown
                startDate={props.startDate}
                strictParsing
                useWeekdaysShort={false}
                onChangeRaw={props.onChangeRaw}
            />
            <button
                aria-controls={staticProps.portalId}
                aria-expanded={props.expanded}
                aria-haspopup
                aria-label={props.screenReaderCalendarCaption ?? "Show calendar"}
                className="btn btn-default btn-calendar"
                onMouseDown={props.onButtonMouseDown}
                onKeyDown={props.onButtonKeyDown}
            >
                <CalendarIcon />
            </button>
        </Fragment>
    );
}

type StaticProps = Omit<ReactDatePickerProps, "onChange">;

function useSetup(): StaticProps {
    const [props] = useState<StaticProps>(() => {
        return {
            popperPlacement: "bottom-start",
            popperProps: {
                strategy: "fixed"
            },
            portalId: `datepicker_` + Math.random()
        };
    });

    return props;
}
