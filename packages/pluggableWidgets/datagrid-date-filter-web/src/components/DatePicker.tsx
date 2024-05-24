import classNames from "classnames";
import { createElement, Fragment, ReactElement, useState } from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DatePickerController } from "../helpers/DatePickerController";
import { FilterStore } from "../helpers/store/FilterStore";
import { CalendarStore } from "../helpers/store/CalendarStore";
import { usePickerState } from "../helpers/usePickerState";
import { getLocale, pickerDateFormat, setupLocales } from "../utils/date-utils";
import CalendarIcon from "./CalendarIcon";

interface DatePickerProps {
    adjustable: boolean;
    datePickerController: DatePickerController;
    filterStore: FilterStore;
    parentId?: string;
    placeholder?: string;
    calendarStore: CalendarStore;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
}

export function DatePicker(props: DatePickerProps): ReactElement {
    const staticProps = useSetup();
    const { datePickerController: controller } = props;
    const state = usePickerState(props.filterStore, props.calendarStore);

    return (
        <Fragment>
            <div id={staticProps.portalId} className="date-filter-container" />
            <span className="sr-only" id={`${props.parentId}-label`}>
                {props.screenReaderInputCaption}
            </span>
            <ReactDatePicker
                {...staticProps}
                allowSameDay={false}
                autoFocus={false}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={state.disabled}
                dropdownMode="select"
                enableTabLoop
                endDate={state.endDate}
                isClearable={state.selectsRange}
                onChange={controller.handlePickerChange}
                onCalendarClose={controller.handleCalendarClose}
                onCalendarOpen={controller.handleCalendarOpen}
                onKeyDown={controller.handleKeyDown}
                placeholderText={props.placeholder}
                ref={controller.pickerRef}
                selected={state.selected}
                selectsRange={state.selectsRange}
                shouldCloseOnSelect={false}
                showMonthDropdown
                showPopperArrow={false}
                showYearDropdown
                startDate={state.startDate}
                strictParsing
                useWeekdaysShort={false}
                onChangeRaw={controller.UNSAFE_handleChangeRaw}
            />
            <button
                aria-controls={staticProps.portalId}
                aria-expanded={state.expanded}
                aria-haspopup
                aria-label={props.screenReaderCalendarCaption ?? "Show calendar"}
                className="btn btn-default btn-calendar"
                onMouseDown={controller.handleButtonMouseDown}
                onKeyDown={controller.handleButtonKeyDown}
            >
                <CalendarIcon />
            </button>
        </Fragment>
    );
}

type StaticProps = Omit<ReactDatePickerProps, "onChange">;

function useSetup(): StaticProps {
    const [props] = useState<StaticProps>(() => {
        const locale = getLocale();
        return {
            calendarStartDay: locale.firstDayOfWeek,
            dateFormat: pickerDateFormat(locale),
            locale: setupLocales(locale),
            popperPlacement: "bottom-start",
            popperProps: {
                strategy: "fixed"
            },
            portalId: `datepicker_` + Math.random()
        };
    });

    return props;
}
