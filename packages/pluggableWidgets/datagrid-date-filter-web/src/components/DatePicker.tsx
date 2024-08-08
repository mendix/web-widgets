import classNames from "classnames";
import { createElement, Fragment, ReactElement, useState } from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "./CalendarIcon";

type InheritedProps = Pick<
    ReactDatePickerProps<boolean>,
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
    id?: string;
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
            <span className="sr-only" id={`${props.id}-label`}>
                {props.screenReaderInputCaption}
            </span>
            <ReactDatePicker
                {...staticProps}
                allowSameDay={false}
                ariaLabelledBy={`${props.id}-label`}
                autoFocus={false}
                calendarStartDay={props.calendarStartDay}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                dateFormat={props.dateFormat}
                disabled={props.disabled}
                dropdownMode="select"
                enableTabLoop
                endDate={props.endDate}
                isClearable={props.selectsRange}
                locale={props.locale}
                onCalendarClose={props.onCalendarClose}
                onCalendarOpen={props.onCalendarOpen}
                onChange={props.onChange}
                onChangeRaw={props.onChangeRaw}
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
